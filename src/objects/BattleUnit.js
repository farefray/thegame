const _ = require('lodash');

export default class BattleUnit {
  constructor(unit, coords) {
    _.assign(this, unit);
    this.x = +coords.x;
    this.y = +coords.y;

    // internal
    this._uid = this.getBoardPosition(); // uid = starting position for mob
    this._previousStep = null;
  }

  get previousStep() {
    return this._previousStep;
  }

  set previousStep(value) {
    this._previousStep = value;
  }

  getUID() {
    return this._uid;
  }

  canCast() {
    return false;
  }

  hasTarget() {
    return !!this._target;
  }

  getTarget() {
    return this._target;
  }

  /**
   * @param {Target} target {position: {Position}, range: {Int}}
   */
  setTarget(target) {
    this._target = target;
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

  isTargetInRange() {
    const target = this.hasTarget() && this.getTarget();

    if (target) {
      const distanceApprox = (p1, p2) => {
        // Approximation by using octagons approach
        const x = p2.x - p1.x;
        const y = p2.y - p1.y;

        // Magic distance formula. ~1 for 1 tile distance, ~1.4 for diagonal
        return 1.426776695 * Math.min(0.7071067812 * (Math.abs(x) + Math.abs(y)), Math.max(Math.abs(x), Math.abs(y)));
      };

      const range = this.attackRange + 1; // +1 for diagonal math tiles
      return distanceApprox(target.getPosition(), this.getPosition()) < range;
    }

    return false;
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
}
