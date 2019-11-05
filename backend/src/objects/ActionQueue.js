const BATTLE_TIME_LIMIT = 300 * 1000; // time limit for battle

export default class ActionQueue {
  /**
   * Creates an instance of ActionQueue.
   * @param {Array[{BattleUnit}]} units
   * @param {Function} actionHandler bound to battle, function 'calculateAction'
   * @param {Function} callback to be executed after actionQueque class is done executing
   * @memberof ActionQueue
   */
  constructor(units, actionHandler, callback) {
    // Please todo some comments about mechanics of actionQueque/actionStack and generator
    this.actionQueue = units.map(unit => {
      unit.proxy({
        name: 'actionQueue',
        instance: this
      });

      return ({
        timestamp: 0,
        unit
      });
    });
    this.actionHandler = actionHandler;
    this.actionGenerator = this.generateActions();
    this.callback = callback || (() => true);
    this._actionStack = [];
    this._currentTimestamp = 0; // while processing generator, saving current processing timestamp here
    this._sideEffects = []; // holding side effects on board which supposed to be executed
  }

  get actionStack() {
    return this._actionStack;
  }

  get currentTimestamp() {
    return this._currentTimestamp;
  }

  addToActionStack(unitId, props) {
    this.actionStack.push({
      ...props,
      unitID: unitId,
      time: this._currentTimestamp
    });
  }

  /**
   * Side effects are events which are happing on battle board, without BattleUnit action
   * @param {SideEffect} sideEffect
   * @memberof ActionQueue
   */
  addSideEffect(sideEffect) {
    const {
      tick,
      amount,
      effect
    } = sideEffect;

    let effectTimestamp = Number(this._currentTimestamp + tick);
    for (let index = 0; index < amount; index++) {
      this._sideEffects.splice(this.constructor.findInsertionIndex(effectTimestamp, this._sideEffects), 0, {
        timestamp: effectTimestamp,
        effect
      });

      effectTimestamp += tick;
    }
  }

  execute() {
    const {
      done
    } = this.actionGenerator.next();
    if (!done) {
      this.execute();
    } else {
      this.callback();
    }
  }

  * generateActions() {
    while (this.actionQueue.length) {
      // Before processing actions from units inside actionQueue, we check for a side effects
      if (this._sideEffects) {
        // we need to check, if there any side effects supposed to happen between last execution of generator and next action from queue
        const closestSideEffectTimestamp = this._sideEffects[0]; // closest side effect
        const closestActionQueue = this.actionQueue[0];
        if (closestSideEffectTimestamp < closestActionQueue.timestamp) {
          // execute side effects first
          // This may lead to problem when garbage collector will never free up this memory, as we are linking function from spell to here via different objects and recursive links will stay. Need proper destruction then to be considered
          const { effect } = this._sideEffects.shift();
          effect();
          yield true;
        }
      }

      const {
        timestamp,
        unit
      } = this.actionQueue.shift();
      this._currentTimestamp = timestamp;
      const nextTimestamp = timestamp + unit.speed;
      this.actionHandler({
        timestamp,
        unit
      });
      if (nextTimestamp < BATTLE_TIME_LIMIT) {
        this.addToActionQueue({
          timestamp: timestamp + unit.speed,
          unit
        });
      }

      yield true;
    }
  }

  addToActionQueue({
    timestamp,
    unit
  }) {
    this.actionQueue.splice(this.constructor.findInsertionIndex(timestamp, this.actionQueue), 0, {
      timestamp,
      unit
    });
  }

  // Removing BattleUnit from actionQueue, as he is not acting anymore(dead)
  removeUnitFromQueue(unit) {
    const unitIndex = this.actionQueue.findIndex(entry => entry.unit === unit);
    if (unitIndex > -1) {
      this.actionQueue.splice(unitIndex, 1);
    }

    // Also clean up all side effects to this unit? todo
  }

  static findInsertionIndex(timestamp, array) {
    let min = 0;
    let max = array.length;
    while (min < max) {
      const mid = (min + max) >>> 1; // eslint-disable-line
      if (array[mid].timestamp < timestamp) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }
    return min;
  }
}