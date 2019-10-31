const BATTLE_TIME_LIMIT = 300 * 1000; // time limit for battle

export default class ActionQueue {
  /**
   *Creates an instance of ActionQueue.
   * @param {*} units
   * @param {*} actionHandler
   * @param {function} callback
   * @memberof ActionQueue
   */
  constructor(units, actionHandler, callback) {
    // Please todo some comments about mechanics of actionQueque/actionStack and generator
    this.actionQueue = units.map(unit => {
      // Using symbol property to map battle unit into current ActionQueque and stay not enumerable
      unit[Symbol.for('proxy')] = {
        actionQueue: this
      };

      return ({ timestamp: 0, unit });
    });
    this.actionHandler = actionHandler;
    this.actionGenerator = this.generateActions();
    this.callback = callback || (() => true);
    this._actionStack = [];
    this._currentTimestamp = 0;
    this._sideEffects = {};
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

  addSideEffect(sideEffect) {
    const { tick, amount, effect } = sideEffect;

    let effectTimestamp = this._currentTimestamp + tick;
    for (let index = 0; index < amount; index++) {
      this._sideEffects[effectTimestamp] = effect;
      effectTimestamp += tick;
    }
  }

  execute() {
    const { done } = this.actionGenerator.next();
    if (!done) {
      this.execute();
    } else {
      this.callback();
    }
  }

  *generateActions() {
    while (this.actionQueue.length) {
      const { timestamp, unit } = this.actionQueue.shift();
      this._currentTimestamp = timestamp;
      const nextTimestamp = timestamp + unit.speed;
      this.actionHandler({ timestamp, unit });
      if (nextTimestamp < BATTLE_TIME_LIMIT) {
        this.addToActionQueue({ timestamp: timestamp + unit.speed, unit });
      }
      yield true;
    }
  }

  addToActionQueue({ timestamp, unit }) {
    this.actionQueue.splice(this.findInsertionIndex(timestamp), 0, { timestamp, unit });
  }

  removeUnitFromQueue(unit) {
    const unitIndex = this.actionQueue.findIndex(entry => entry.unit === unit);
    if (unitIndex > -1) {
      this.actionQueue.splice(unitIndex, 1);
    }
  }

  findInsertionIndex(timestamp) {
    let min = 0;
    let max = this.actionQueue.length;
    while (min < max) {
      const mid = (min + max) >>> 1; // eslint-disable-line
      if (this.actionQueue[mid].timestamp < timestamp) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }
    return min;
  }
}
