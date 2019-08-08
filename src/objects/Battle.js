const _ = require('lodash');

const BATTLE_TIME_LIMIT = 30 * 1000; // time limit for battle

/*
[ [ '0,8', '1,8', '2,8', '3,8', '4,8', '5,8', '6,8', '7,8' ],
  [ '0,7', '1,7', '2,7', '3,7', '4,7', '5,7', '6,7', '7,7' ],
  [ '0,6', '1,6', '2,6', '3,6', '4,6', '5,6', '6,6', '7,6' ],
  [ '0,5', '1,5', '2,5', '3,5', '4,5', '5,5', '6,5', '7,5' ],
  [ '0,4', '1,4', '2,4', '3,4', '4,4', '5,4', '6,4', '7,4' ],
  [ '0,3', '1,3', '2,3', '3,3', '4,3', '5,3', '6,3', '7,3' ],
  [ '0,2', '1,2', '2,2', '3,2', '4,2', '5,2', '6,2', '7,2' ],
  [ '0,1', '1,1', '2,1', '3,1', '4,1', '5,1', '6,1', '7,1' ],
  [ '0,0', '1,0', '2,0', '3,0', '4,0', '5,0', '6,0', '7,0' ] ]
*/
function Battle(board) {
  // returnable values
  this.startBoard = _.cloneDeep(board); // test if thats needed or just adding perf issues
  this.actionStack = [];
  this.winner = null;

  // internal values
  this.isOver = false;
  this.battleBoard = _.cloneDeep(board);
  this.nextTickSchedule = null;

  // int setup, maybe move to some unit creation
  for (const unitPos in board) {
    this.battleBoard[unitPos]['next_action'] = this.battleBoard[unitPos]['speed'];
  }
}

Battle.prototype.execute = async function () {
  // Not sure, but this way we probably can split battle executing into multiple ticks, to avoid io blocking. Its not a real solution, but at least it will proceed multiple battles at once, just slower than usually :D need to perf these ways
  while (!this.isOver && this.nextTickSchedule <= BATTLE_TIME_LIMIT) {
    await this.nextTick();
  }

  return this;
};

Battle.prototype.nextTick = async function () {
  return new Promise((resolve) => {
    resolve(this.tick());
  });
};

/**
 * @function
 * @description determines units whose action is next on the board
 * @returns {Array}
 */
Battle.prototype.getNextUnitsToAction = function () {
  let units = [];
  let closestActionTime = null;
  for (const unitPos in this.battleBoard) {
    const unit = this.battleBoard[unitPos];
    if (!closestActionTime || unit['next_action'] < closestActionTime) {
      units = [unitPos];
      closestActionTime = unit['next_action'];
    } else if (unit['next_action'] === closestActionTime) {
      // this unit's action is same time with some other units
      units.push(unitPos);
    }
  }

  return units;
};

/**
 * Single tick for battle execution.
 */
Battle.prototype.tick = function () {
  this.nextTickSchedule = (this.nextTickSchedule || 0) + 1000;

  const units = this.getNextUnitsToAction();
  units.forEach((unitPos) => {
    
  });
  console.log("TCL: Battle.prototype.tick -> unit", unit);
};

module.exports = Battle;
