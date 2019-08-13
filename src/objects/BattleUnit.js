
const _ = require('lodash');

function BattleUnit(unit, coords) {
  _.assign(this, unit);
  this.x = +(coords.x);
  this.y = +(coords.y);
  this.nextAction(this.speed);
  return this;
}

BattleUnit.prototype.nextAction = function (actionTime) {
  if (actionTime) {
    this._next_action = actionTime;
  }

  return this._next_action;
};

BattleUnit.prototype.canCast = function () {
  return false;
};

BattleUnit.prototype.hasTarget = function () {
  return !!this._target && this._target.position;
};

BattleUnit.prototype.getTarget = function () {
  return this._target;
};

/**
 * @param {Target} target {position: {Position}, range: {Int}}
 */
BattleUnit.prototype.setTarget = function (target) {
  this._target = target;
};

BattleUnit.prototype.oppositeTeam = function () {
  return 1 - this.team;
};

BattleUnit.prototype.move = function (coords) {
  this.x = +(coords.x);
  this.y = +(coords.y);
};


BattleUnit.prototype.getBoardPosition = function () {
  return `${this.x},${this.y}`;
};

BattleUnit.prototype.isAlive = function () {
  return this.hp > 0;
};

BattleUnit.prototype.removeHealth = function (amount) {
  this.hp = this.hp <= amount ? 0 : this.hp - amount;
};

BattleUnit.prototype.isTargetInRange = function () {
  return this.hasTarget() && this._target.kDistance <= this.range + 1; // kDistance is not a real distance, todo for distance:)
};

/**
 * @description Mutating both units by attacking
 * @warning Mutating objects
 */
BattleUnit.prototype.doAttack = function (targetUnit) {
  // TODO better stuff
  const damageRatio = this.attack / targetUnit.defense;
  const factor = 0.125 * this.attack * damageRatio;
  const damage = Math.round(factor);

  targetUnit.removeHealth(damage);
};

module.exports = BattleUnit;
