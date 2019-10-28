import _ from 'lodash';

/**
 * @export
 * @class BattleUnit
 */
export default class BattleUnit {
  constructor(unit, coords, team) {
    _.assign(this, unit);
    this.x = +coords.x;
    this.y = +coords.y;
    this.team = team;

    // frontend
    this.position = this.getBoardPosition(); // fixme

    // internal
    this._uid = this.getBoardPosition(); // uid = starting position for mob
    this._previousStep = null;
    this._mana = 0;
    this._actionLockTimestamp = 0;
    this._previousActionTimestamp = 0;
  }

  get previousStep() {
    return this._previousStep;
  }

  set previousStep(value) {
    this._previousStep = value;
  }

  get actionLockTimestamp() {
    return this._actionLockTimestamp;
  }

  set actionLockTimestamp(value) {
    this._actionLockTimestamp = value;
  }

  get previousActionTimestamp() {
    return this._previousActionTimestamp;
  }

  set previousActionTimestamp(value) {
    this._previousActionTimestamp = value;
  }

  get mana() {
    return this._mana;
  }

  set mana(value) {
    this._mana = Math.max(0, Math.min(100, value));
  }

  get id() {
    return this._uid;
  }

  getUID() {
    return this._uid;
  }

  canCast() {
    return this.mana === this.maxMana;
  }

  oppositeTeam() {
    return 1 - this.team;
  }

  move(coords) {
    this.x = +coords.x;
    this.y = +coords.y;
  }

  getBoardPosition() {
    return `${this.x},${this.y}`;
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y
    };
  }

  isAlive() {
    return this.hp > 0;
  }

  removeHealth(amount) {
    this.hp = this.hp <= amount ? 0 : this.hp - amount;
  }

  /**
   * @description Mutating both units by attacking
   * @warning Mutating objects
   */
  doAttack(targetUnit) {
    const multiplier = 1 - (0.052 * targetUnit.armor) / (0.9 + 0.048 * targetUnit.armor);
    const maximumRoll = Math.floor(this.attack * 1.1);
    const minimumRoll = Math.ceil(this.attack * 0.9);
    const damage = Math.floor(multiplier * Math.floor(Math.random() * (maximumRoll - minimumRoll + 1)) + minimumRoll);
    targetUnit.removeHealth(damage);
    return {
      damage
    };
  }

  onAction(timestamp) {
    const elapsedMilliseconds = timestamp - this.previousActionTimestamp;
    const manaGained = Math.floor((this.manaRegen * elapsedMilliseconds) / 1000);
    const healthGained = Math.floor((this.healthRegen * elapsedMilliseconds) / 1000);
    this.mana += manaGained;
    this.hp += healthGained;
    this.previousActionTimestamp = timestamp;
  }
}
