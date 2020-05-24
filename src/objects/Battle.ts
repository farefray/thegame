import Pathfinder from './Pathfinder';
import Actor from './Actor';
import TargetPairPool from './TargetPairPool';
import BattleUnit from './BattleUnit';
import { ACTION_TYPE, Action } from './Action';
import { ACTION, TEAM } from '../shared/constants';
import BoardMatrix from '../utils/BoardMatrix';
import BattleUnitList from './BattleUnit/BattleUnitList';

/**
 * TODO: move this into Battle.d.ts, just need to investigate if thats fine to use classes in types,
 * as this will require importing real classes for .d.ts file which may be no optimal solution
 */
export interface BattleContext {
  currentTimestamp: number;
  pathfinder: Pathfinder;
  targetPairPool: TargetPairPool;
  units: BattleUnitList;
}

export interface BattleResult {
  battleTime: number;
  actionStack: Array<Object>;
  startBoard: BoardMatrix;
  participants: Array<string>;
  winner: string;
  finalBoard: BattleUnitList; // DEBUG needs for generating train data of naural network. Should be rewrited
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

export interface BattleBoard {
  units: BattleUnitList;
  owner: string;
}

export default class Battle {
  private startBoard: BoardMatrix;
  private winner = TEAM.NONE;
  private readonly actionStack: UnitAction[];
  private readonly pathfinder: Pathfinder;
  private units: BattleUnitList; // temporaly public for ai needs
  private readonly actorQueue: Actor[] = [];
  private readonly targetPairPool: TargetPairPool;
  private currentTimestamp: number;
  private isOver = false;
  private actionGeneratorInstance: Generator;
  private battleTimeEndTime = 300 * 1000; // timeout for battle to be finished

  constructor(unitBoards: Array<BattleBoard>) {
    this.startBoard = new BoardMatrix(8, 8);
    this[Symbol.for('owners')] = {};

    if (unitBoards.length) {
      unitBoards.forEach((unitBoard, teamId) => {
        if (unitBoard.owner) {
          this[Symbol.for('owners')][teamId] = unitBoard.owner;
        }

        if (unitBoard.units.size) {
          for (const unit of unitBoard.units) {
            /**
             * TODO P0 - Investigate this. based on what we see on Session, units are alrdy a battleunitlist with battle units.
             * Shall we create them? Or they supposed to be unitConfigs, not units.
             */
            const battleUnit = new BattleUnit({
              name: unit.name,
              x: unit.x,
              y: unit.y,
              teamId,
            });

            // actually startBoard shouldnt nessesary to be a full unit matrix. Only representation will be enought
            this.startBoard.setCell(unit.x, unit.y, battleUnit);
          }
        }
      });
    }

    this.currentTimestamp = 0;
    this.actionStack = [];
    this.targetPairPool = new TargetPairPool();

    /**
     * Actually object with units to calculate battle
     * clone is needed here in order to remove symlinks to our startBoard battle units and they can be passed normally
     */
    this.units = this.startBoard.units().shuffle();

    // dirty way to unlink units from startboard, need to be revised
    this.startBoard = JSON.parse(JSON.stringify(this.startBoard));

    this.pathfinder = new Pathfinder();

    for (const unit of this.units) {
      this.pathfinder.taken(unit.position)
      this.actorQueue.push(new Actor({
        id: unit.id,
        actionGenerator: unit.unitLifeCycleGenerator(),
        timestamp: 0,
      }))
    }

    this.actionGeneratorInstance = this.generateActions();
  }

  get context(): BattleContext {
    return {
      currentTimestamp: this.currentTimestamp,
      pathfinder: this.pathfinder,
      targetPairPool: this.targetPairPool,
      units: this.units,
    };
  }

  updateUnits() {
    this.units.filter(unit => unit.isAlive, true);
    console.log("Battle -> updateUnits -> updateUnits", this.units)

    if (!this.units.byTeam(TEAM.A).size || !this.units.byTeam(TEAM.B).size) {
      console.log('is over ', this.currentTimestamp);
      this.isOver = true;
      this.battleTimeEndTime = this.currentTimestamp + 2500; // we ends battle in 2.5 seconds, in order to finish attacks, particles, animations
    }
  }

  async proceedBattle() {
    while (!this.isOver) {
      // action was generated already, so we dont need to execute another next() here
      const { done, value } = await this.actionGeneratorInstance.next();

      if (done) {
        this.isOver = done;
      }
    }

    this.setWinner();

    return this.battleResult;
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
          for (const sideActor of value.actors) {
            this.actorQueue.splice(this.findInsertionIndex(sideActor.timestamp), 0, sideActor);
          }
        }

        delay = value.actionDelay || 0;
        if (delay) break;
      }

      if (!fullyDone) {
        actor.timestamp = this.currentTimestamp + delay;
        this.actorQueue.splice(this.findInsertionIndex(actor.timestamp), 0, actor); // maybe binary heap will be better solution to this
      }

      yield true;
    }
  }

  findInsertionIndex(timestamp) {
    let min = 0;
    let max = this.actorQueue.length;
    while (min < max) {
      // tslint:disable-next-line: no-bitwise
      const mid = (min + max) >>> 1;
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
      (this.isOver /* && !([ACTION_TYPE.DEATH].includes(action.type)) */)) {
      // ? dont proceed new actions if battle is finished, we only need old queued damage actors to finish
      // TODO why isOver not handling this?
      return;
    }

    switch (action.type) {
      /*
        TODO: action.type === ACTION_TYPE. === ACTION.; It could be same variable
      */
      case ACTION_TYPE.MOVE:
        const { from, to } = action.payload;
        this.pathfinder.free(from);
        this.pathfinder.taken(to);
        this.addToActionStack(action, ACTION.MOVE);
        break;
      case ACTION_TYPE.ATTACK:
        this.addToActionStack(action, ACTION.ATTACK);
        break;
      case ACTION_TYPE.CAST:
        this.addToActionStack(action, ACTION.CAST);
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
        this.pathfinder.free(unit.position);
        this.targetPairPool.removeByUnitId(unit.id);
        this.updateUnits();
        this.addToActionStack(action, ACTION.DEATH);
        break;
      case ACTION_TYPE.ACQUIRE_TARGET:
        const { attacker, target } = action.payload;
        this.targetPairPool.removeByAttackerId(attacker.id);
        this.targetPairPool.add({ attacker, target });
        break;
      case ACTION_TYPE.RESCHEDULE_ACTOR: // ? I dont feel thats a best way to make stun. Maybe consider some conditions mechanics?
        // todo fix for case when resceduling, it actually rescheduling up to timeing when battle is over already and there is no need to execute those actors
        const { timestamp, targetId } = action.payload;
        console.log("Battle -> processAction -> action", action)
        const actor = this.actorQueue.find(actor => actor.id === targetId);
        console.log("Battle -> processAction -> actor", actor)
        if (actor) {
          actor.timestamp = actor.timestamp + timestamp;
        }

        this.addToActionStack(action, ACTION.EFFECT);
        break;
      default:
        // thats actionBase only left and it has no type, just side effects(spell animation for example)
        this.addToActionStack(action, ACTION.EFFECT);
    }
  }

  addToActionStack(action, type): void {
    const { unitID, payload } = action;
    const actionStackItem: any = { type, unitID, payload, time: this.currentTimestamp };
    // ? Cant we just destruct object into actionStackItem? TODO
    if (action.effects) {
      actionStackItem.effects = action.effects;
    }

    if (action.uid) {
      actionStackItem.uid = action.uid;
    }

    if (action.parent) {
      actionStackItem.parent = action.parent;
    }

    if (action.spellName) {
      actionStackItem.spellName = action.spellName;
    }

    this.actionStack.push(actionStackItem);
  }

  setWinner() {
    const aTeamUnits = this.units.byTeam(TEAM.A);
    const bTeamUnits = this.units.byTeam(TEAM.B);

    if (!aTeamUnits.size || !bTeamUnits.size) {
      this.winner = aTeamUnits.size ? this[Symbol.for('owners')][0] : this[Symbol.for('owners')][1]; // todo support for more board owners?
    } else {
      this.winner = '';
    }
  }

  /**
   * @description optimizes actionStack for frontend, formatting chained actions
   */
  get optimizedActionStack() {
    const uidMap = {};

    // building uidMap first
    this.actionStack.forEach((action, index) => {
      if (action.uid) {
        uidMap[action.uid] = action;
      }
    });

    this.actionStack.forEach((action, index) => {
      if (action.parent) {
        // We are chaining actions in order to execute them immediatly(after/in the middle) on frontend, instead of trusting our schedule
        try {
          if (!uidMap[action.parent]) {
            // TODO avoid such issues
            throw new Error('Stack optimization failed');
          }

          uidMap[action.parent].chainedAction = action;
        } catch (e) {
          // in case error happened, we remove parent reference (this is very bad, we need to fix this)
          console.warn('Wrong action parent during optimization!', JSON.parse(JSON.stringify((action))));
          delete action.parent;
        }
      }
    });

    return this.actionStack.filter(action => !action.parent).sort((a, b) => ((a.time > b.time) ? 1 : -1));
  }

  // output for a battle execution
  get battleResult(): BattleResult {
    return {
      actionStack: this.optimizedActionStack,
      battleTime: this.currentTimestamp,
      winner: this.winner,

      startBoard: this.startBoard, // todo unlink? matrix to json?
      participants: Object.values(this[Symbol.for('owners')]), // ??
      finalBoard: this.units // OMIT this!!
    }
  }
}
