const EasyStar = require('easystarjs');
const _ = require('lodash');
const f = require('../f');
const { kdTree } = require('../alg/kdTree');

const BattleUnit = require('./BattleUnit');

const BATTLE_TIME_LIMIT = 10 * 1000; // time limit for battle

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
const TEAM_A = 0;
const TEAM_B = 1;
const FREE_TILE = 0;
const TAKEN_TILE = 1;

const createPathMap = function (width, height) {
  const grid = [];
  for (let y = 0; y < height; y++) {
    grid.push([]);
    for (let x = 0; x < width; x++) {
      grid[y][x] = FREE_TILE;
    }
  }

  return grid;
};

function Battle(board) {
  // returnable values
  this.startBoard = _.cloneDeep(board); // test if thats needed or just adding perf issues
  this.actionStack = [];
  this.winner = null;

  // internal values
  this.isOver = false;
  this.battleBoard = {};
  this.nextTickSchedule = null;
  this.coordsBoardMap = {
    [TEAM_A]: [],
    [TEAM_B]: []
  };

  // used for pathfinding (todo func)
  this.pathMap = createPathMap(9, 9);

  // internal setup
  for (const boardPos in board) {
    const battleUnit = new BattleUnit(board[boardPos], f.coords(boardPos)); // maybe f.* is overhead
    this.battleBoard[boardPos] = battleUnit;
    const coordPos = {
      x: f.x(boardPos),
      y: f.y(boardPos)
    };

    this.coordsBoardMap[battleUnit.team].push(coordPos);
    this.pathMap[battleUnit.x][battleUnit.y] = TAKEN_TILE;
  }

  // algs
  this.pathfinder = new EasyStar.js();
}

Battle.prototype.execute = async function () {
  // Not sure, but this way we probably can split battle executing into multiple ticks, to avoid io blocking. Its not a real solution, but at least it will proceed multiple battles at once, just slower than usually :D need to perf these ways
  while (!this.isOver && this.nextTickSchedule <= BATTLE_TIME_LIMIT) {
    await this.nextTick();
  }

  return this;
};

/**
 * @param {BattleUnit} battleUnit
 * @param {Object} step
 */
Battle.prototype.moveUnit = function (battleUnit, step) {

};

/**
 * @todo !urgent current pathfinder is very slow for such battles
 * @description processing battle tick. One step(or multiple if they happen same time)
 */
Battle.prototype.nextTick = async function () {
  return new Promise((resolve) => {
    const finishTick = () => resolve();

    this.nextTickSchedule = (this.nextTickSchedule || 0) + 1000;

    const units = this.getNextUnitsToAction();
    units.forEach((battleUnit) => {
      if (battleUnit.canCast()) {
        // tODO
      } else if (battleUnit.hasTarget()) {
        // TODO
      } else {
        // get target
        const closestEnemy = this.getClosestEnemy(battleUnit);

        // get path to target [todo first move can be done just by direction if possible. Use pathfinder only when needed]
        this.pathfinder.setGrid(this.pathMap);
        this.pathfinder.setAcceptableTiles([FREE_TILE]);
        console.log('setted up pathfinder');
        console.log(battleUnit.x, battleUnit.y, closestEnemy.position.x, closestEnemy.position.y);
        this.pathfinder.findPath(battleUnit.x, battleUnit.y, closestEnemy.position.x, closestEnemy.position.y, (path) => {
          console.log("TCL: path", path)
          if (path && path.length > 0) {
            const nextStep = path[1];
            console.log("TCL: nextStep", nextStep)
            f.p('Move: ', battleUnit.x, ', ', battleUnit.y, 'to', nextStep);
            this.moveUnit(battleUnit, nextStep);
          } else {
            // no path found. Lets skip step and try next tick(todo)
          }
          finishTick();
        });

        console.log('launching up pathfinder');
        this.pathfinder.calculate(); // running our path finding. Next action will be taken inside callback.
        // Moving to our target
      }
    });
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
    const battleUnit = this.battleBoard[unitPos];
    if (!closestActionTime || battleUnit.nextAction() < closestActionTime) {
      units = [battleUnit];
      closestActionTime = battleUnit.nextAction();
    } else if (battleUnit.nextAction() === closestActionTime) {
      // this unit's action is same time with some other units
      units.push(battleUnit);
    }
  }

  return units;
};


/**
 * @todo perf this against old method after finishding direction(for_perf_kdtree.js)
 * @param {BattleUnit} battleUnit
 * @returns {Object({position: {Position}, withinRange: {Boolean}})} 
 */
Battle.prototype.getClosestEnemy = function (battleUnit) {
  const enemiesCoords = this.coordsBoardMap[battleUnit.oppositeTeam()];
  // eslint-disable-next-line
  const tree = new kdTree(enemiesCoords, function (a, b) {
    return ((a.x - b.x) ** 2) + ((a.y - b.y) ** 2);
  }, ['x', 'y']);
  const range = 1;
  const closestEnemy = tree.nearest({ x: battleUnit.x, y: battleUnit.y }, range);
  if (closestEnemy.length) {
    return {
      position: {
        x: +(closestEnemy[0][0].x),
        y: +(closestEnemy[0][0].y)
      },
      withinRange: closestEnemy[0][1] === 1
    };
  }

  throw new Error('No unit found for target');
};

module.exports = Battle;
