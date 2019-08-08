
const _ = require('lodash');

function BattleUnit(unit, coords) {
  _.assign(this, unit);
  this.x = coords.x;
  this.y = coords.y;
  this.nextAction(this.speed);
  return this;
};


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
  return !!this._target;
};

BattleUnit.prototype.oppositeTeam = function () {
  return 1 - this.team;
};

module.exports = BattleUnit;
