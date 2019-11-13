import Pathfinder from './Pathfinder';
import shuffle from 'lodash/shuffle';
import cloneDeep from 'lodash/cloneDeep';
import Actor from './Actor';
import TargetPairPool from './TargetPairPool';
import BattleUnit from './BattleUnit';
import { ACTION_TYPE, Action } from './Action';
import { ACTION, TEAM } from '../../../frontend/src/shared/constants';

const BATTLE_TIME_LIMIT = 300 * 1000;

export interface Context {
  currentTimestamp: number;
  pathfinder: Pathfinder;
  targetPairPool: TargetPairPool;
  units: BattleUnit[];
}

export default class Battle {
  public startBoard: Object;
  public winner: number;
  public playerDamage: number;
  private currentTimestamp: number;
  private readonly actionStack: Object[];
  private readonly pathfinder: Pathfinder;
  private readonly actionGenerator: Generator;
  private readonly units: BattleUnit[];
  private readonly actorQueue: Actor[];
  private readonly targetPairPool: TargetPairPool;

  constructor({ board, gridWidth = 8, gridHeight = 8 }) {
    this.startBoard = cloneDeep(board);
    this.winner = TEAM.NONE;
    this.playerDamage = 0;

    this.currentTimestamp = 0;
    this.actionStack = [];
    this.targetPairPool = new TargetPairPool();
    this.units = shuffle(Object.keys(board).map(key => board[key]));
    this.actorQueue = this.units.map(unit => new Actor({ id: unit.id, actionGenerator: unit.actionGenerator(), timestamp: 0 }));
    this.pathfinder = new Pathfinder({ gridWidth, gridHeight });
    this.units.forEach(unit => this.pathfinder.occupiedTileSet.add(`${unit.x},${unit.y}`));

    this.actionGenerator = this.generateActions();
    this.consumeActionGenerator();
  }

  get context(): Context {
    return {
      currentTimestamp: this.currentTimestamp,
      pathfinder: this.pathfinder,
      targetPairPool: this.targetPairPool,
      units: this.units
    };
  }

  consumeActionGenerator() {
    while (!this.actionGenerator.next().done) {
      this.actionGenerator.next();
    }
    this.setWinner();
  }

  *generateActions() {
    while (this.actorQueue.length && this.currentTimestamp <= BATTLE_TIME_LIMIT) {
      const actor = this.actorQueue.shift();
      if (!actor) continue;
      this.currentTimestamp = actor.timestamp;
      let fullyDone = false;
      let delay = 0;
      while (!fullyDone) {
        const { value, done } = actor.actionGenerator.next(this.context);
        fullyDone = !!done;
        if (!value) continue;

        if (value.actions) {
          for (const action of value.actions || []) {
            this.processAction(action);
          }
        }

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
      case ACTION_TYPE.DEATH:
        const { unit } = action.payload;
        this.pathfinder.occupiedTileSet.delete(`${unit.x},${unit.y}`);
        this.targetPairPool.removeByUnitId(unit.id);
        break;
      case ACTION_TYPE.ACQUIRE_TARGET:
        const { attacker, target } = action.payload;
        this.targetPairPool.removeByAttackerId(attacker.id);
        this.targetPairPool.add({ attacker, target });
        break;
      default:
        console.log(action, 'default');
        break;
    }
  }

  addToActionStack(action, type): void {
    const { unitId, payload } = action;
    this.actionStack.push({ type, unitID: unitId, payload, time: this.currentTimestamp });
  }

  setWinner() {
    const aTeamUnits = this.units.filter(unit => unit.teamId === TEAM.A && unit.isAlive);
    const bTeamUnits = this.units.filter(unit => unit.teamId === TEAM.B && unit.isAlive);

    if (!aTeamUnits.length || !bTeamUnits.length) {
      this.winner = aTeamUnits.length ? TEAM.A : TEAM.B;
    }

    if (bTeamUnits.length) {
      this.playerDamage = 5; // todo count damage based on units left?
    }
  }
}
