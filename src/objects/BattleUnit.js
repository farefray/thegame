const _ = require('lodash');

function BattleUnit(unit, coords) {
  _.assign(this, unit);
  this.x = +coords.x;
  this.y = +coords.y;

  // internal
  this._uid = this.getBoardPosition(); // uid = starting position for mob
  return this;
}

BattleUnit.prototype.getUID = function() {
  return this._uid;
};

BattleUnit.prototype.canCast = function() {
  return false;
};

BattleUnit.prototype.hasTarget = function() {
  return !!this._target;
};

BattleUnit.prototype.getTarget = function() {
  return this._target;
};

/**
 * @param {Target} target {position: {Position}, range: {Int}}
 */
BattleUnit.prototype.setTarget = function(target) {
  this._target = target;
};

BattleUnit.prototype.oppositeTeam = function() {
  return 1 - this.team;
};

BattleUnit.prototype.move = function(coords) {
  this.x = +coords.x;
  this.y = +coords.y;
};

BattleUnit.prototype.getBoardPosition = function() {
  return `${this.x},${this.y}`;
};

BattleUnit.prototype.getPosition = function() {
  return {
    x: this.x,
    y: this.y
  };
};

BattleUnit.prototype.isAlive = function() {
  return this.hp > 0;
};

BattleUnit.prototype.removeHealth = function(amount) {
  this.hp = this.hp <= amount ? 0 : this.hp - amount;
};

BattleUnit.prototype.isTargetInRange = function() {
  const target = this.hasTarget() && this.getTarget();

  if (target) {
    const distanceApprox = (p1, p2) => {
      // Approximation by using octagons approach
      const x = p2.x - p1.x;
      const y = p2.y - p1.y;

      // Magic distance formula. ~1 for 1 tile distance, ~1.4 for diagonal
      return 1.426776695 * Math.min(0.7071067812 * (Math.abs(x) + Math.abs(y)), Math.max(Math.abs(x), Math.abs(y)));
    };

    const range = this.range + 1; // +1 for diagonal math tiles
    return distanceApprox(target.getPosition(), this.getPosition()) < range;
  }

  return false;
};

/**
 * @description Mutating both units by attacking
 * @warning Mutating objects
 */
BattleUnit.prototype.doAttack = function(targetUnit) {
  const multiplier = 1 - (0.052 * targetUnit.armor) / (0.9 + 0.048 * targetUnit.armor);
  const maximumRoll = Math.floor(this.attack * 1.1);
  const minimumRoll = Math.ceil(this.attack * 0.9);
  const damage = Math.floor(multiplier * Math.floor(Math.random() * (maximumRoll - minimumRoll + 1)) + minimumRoll);
  targetUnit.removeHealth(damage);
  return {
    damage
  };
};

module.exports = BattleUnit;
