import Pathfinder from './Pathfinder';
import shuffle from 'lodash/shuffle';
import cloneDeep from 'lodash/cloneDeep';
import Actor from './Actor';
import TargetPairPool from './TargetPairPool';
import BattleUnit from './BattleUnit';
import { ACTION_TYPE, Action } from './Action';
import { ACTION, TEAM } from '../../../frontend/src/shared/constants';

export interface BattleContext {
  currentTimestamp: number;
  pathfinder: Pathfinder;
  targetPairPool: TargetPairPool;
  units: BattleUnit[];
}

export interface BattleResult {
  battleTime: number,
  actionStack: Array<Object>,
  startBoard: Object,
  winner: string
}

export interface UnitAction {
  type: string;
  unitID: string;
  payload: object;
  time: number;
  effects?: [];
  uid?: string;
  parent?: string;
}

export default class Battle {
  public startBoard: Object;
  public winner: string;
  public readonly actionStack: UnitAction[];
  public firstTeamOwner: string;
  public secondTeamOwner: string;
  private readonly pathfinder: Pathfinder;
  private units: BattleUnit[];
  private readonly actorQueue: Actor[];
  private readonly targetPairPool: TargetPairPool;
  private currentTimestamp: number;
  private isOver: boolean;
  private actionGeneratorInstance: Generator;
  private battleTimeEndTime: number; // timeout for battle to be finished

  constructor({ board, gridWidth = 8, gridHeight = 8 }) {
    this.startBoard = cloneDeep(board);
    this.winner = TEAM.NONE;
    this.firstTeamOwner = board[Symbol.for('_firstOwner')];
    this.secondTeamOwner = board[Symbol.for('_secondOwner')];

    this.isOver = false;
    this.battleTimeEndTime = 300 * 1000;

    this.currentTimestamp = 0;
    this.actionStack = [];
    this.targetPairPool = new TargetPairPool();
    this.units = shuffle(Object.keys(board).map(key => board[key]));
    this.actorQueue = this.units.map(
      unit =>
        new Actor({
          id: unit.id,
          actionGenerator: unit.actionGenerator(),
          timestamp: 0
        }) // adding first run of actionGenerator for every unit in order to spawn
    );
    this.pathfinder = new Pathfinder({ gridWidth, gridHeight });
    this.units.forEach(unit => this.pathfinder.occupiedTileSet.add(`${unit.x},${unit.y}`));

    this.actionGeneratorInstance = this.generateActions();
    this.proceedBattle(); // this is sync call. We can consider using node 10+ and async generators here
  }

  get context(): BattleContext {
    return {
      currentTimestamp: this.currentTimestamp,
      pathfinder: this.pathfinder,
      targetPairPool: this.targetPairPool,
      units: this.units
    };
  }

  updateUnits() {
    this.units = this.units.filter(unit => unit.isAlive);

    if (!this.unitsFromTeam(TEAM.A).length || !this.unitsFromTeam(TEAM.B).length) {
      this.isOver = true;
      this.battleTimeEndTime = this.currentTimestamp + 2500; // we ends battle in 2.5 seconds, in order to finish attacks, particles, animations
    }
  }

  proceedBattle() {
    while (!this.actionGeneratorInstance.next().done) {
      // action was generated already, so we dont need to execute another next() here
    }

    this.setWinner();
  }

  *generateActions() {
    while (this.actorQueue.length && this.currentTimestamp <= this.battleTimeEndTime) {
      const actor = this.actorQueue.shift();
      if (!actor) continue;

      this.currentTimestamp = actor.timestamp;
      let fullyDone = false;
      let delay = 0;
      while (!fullyDone) {
        const { value, done } = actor.actionGenerator.next(this.context);
        fullyDone = !!done;
        if (!value) continue;

        // processed action spawning more actions to be executed
        if (value.actions) {
          for (const action of value.actions || []) {
            this.processAction(action);
          }
        }

        // processed action spawned actors to be placed into queue
        if (value.actors) {
          for (const actor of value.actors) {
            this.actorQueue.splice(this.findInsertionIndex(actor.timestamp), 0, actor);
          }
        }

        delay = value.delay || 0;
        if (delay) break;
      }

      if (!fullyDone) {
        actor.timestamp = this.currentTimestamp + delay;
        this.actorQueue.splice(this.findInsertionIndex(actor.timestamp), 0, actor);
      }

      yield true;
    }
  }

  findInsertionIndex(timestamp) {
    let min = 0;
    let max = this.actorQueue.length;
    while (min < max) {
      const mid = (min + max) >>> 1; // eslint-disable-line
      if (this.actorQueue[mid].timestamp < timestamp) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }
    return min;
  }

  processAction(action: Action) {
    if (!action ||
      (this.isOver && action.type !== ACTION_TYPE.HEALTH_CHANGE && action.type !== ACTION_TYPE.DEATH)) {
      // dont proceed new actions if battle is finished, we only need old queued damage actors to finish
      return;
    }

    switch (action.type) {
      case ACTION_TYPE.MOVE:
        const { from, to } = action.payload;
        this.pathfinder.occupiedTileSet.delete(`${from.x},${from.y}`);
        this.pathfinder.occupiedTileSet.add(`${to.x},${to.y}`);
        this.addToActionStack(action, ACTION.MOVE);
        break;
      case ACTION_TYPE.ATTACK:
        this.addToActionStack(action, ACTION.ATTACK);
        break;
      case ACTION_TYPE.HEALTH_CHANGE:
        this.addToActionStack(action, ACTION.HEALTH_CHANGE);
        break;
      case ACTION_TYPE.MANA_CHANGE:
        this.addToActionStack(action, ACTION.MANA_CHANGE);
        break;
      case ACTION_TYPE.SPAWN:
        this.addToActionStack(action, ACTION.SPAWN);
        break;
      case ACTION_TYPE.DEATH:
        const { unit } = action.payload;
        this.pathfinder.occupiedTileSet.delete(`${unit.x},${unit.y}`);
        this.targetPairPool.removeByUnitId(unit.id);
        this.updateUnits();
        this.addToActionStack(action, ACTION.DEATH);
        break;
      case ACTION_TYPE.ACQUIRE_TARGET:
        const { attacker, target } = action.payload;
        this.targetPairPool.removeByAttackerId(attacker.id);
        this.targetPairPool.add({ attacker, target });
        break;
      case ACTION_TYPE.RESCHEDULE_ACTOR:
        const { actorId, timestamp } = action.payload;
        const actor = this.actorQueue.find(actor => actor.id === actorId);
        if (actor) {
          actor.timestamp = timestamp;
        }
        break;
      default:
        console.log(action, 'default');
        break;
    }
  }

  addToActionStack(action, type): void {
    const { unitID, payload } = action;
    const actionStackItem:any = { type, unitID, payload, time: this.currentTimestamp };
    action.effects && (actionStackItem.effects = action.effects);
    action.uid && (actionStackItem.uid = action.uid);
    action.parent && (actionStackItem.parent = action.parent);

    this.actionStack.push(actionStackItem);
  }

  unitsFromTeam(teamId: number) {
    return this.units.filter(unit => unit.teamId === teamId && unit.isAlive);
  }

  setWinner() {
    const aTeamUnits = this.unitsFromTeam(TEAM.A);
    const bTeamUnits = this.unitsFromTeam(TEAM.B);

    if (!aTeamUnits.length || !bTeamUnits.length) {
      this.winner = aTeamUnits.length ? this.firstTeamOwner : this.secondTeamOwner;
    }
  }
}
