import ActionQueue from './ActionQueue';
import Pathfinder from './Pathfinder';

const _ = require('lodash');
const f = require('../f');
const { kdTree } = require('../alg/kdTree');

const Position = require('../../app/src/objects/Position');

const BattleUnit = require('./BattleUnit');

const { TEAM } = require('../../app/src/shared/constants');

const ACTION_MOVE = 1; // todo share with frontend
const ACTION_ATTACK = 2;

/**
 * @consider Using Map/Set instead of Object/Array
 */
export default class Battle {
  constructor(board) {
    // returnable values
    this.startBoard = _.cloneDeep(board); // test if thats needed or just adding perf issues
    this.actionStack = [];
    this.winner = null;
    this.playerDamage = 0;

    // internal values
    this.isOver = false;
    this.battleBoard = {};
    this.nextTickSchedule = null;
    this.coordsBoardMap = {
      [TEAM.A]: [],
      [TEAM.B]: []
    };

    const units = [];
    this.pathfinder = new Pathfinder({ gridWidth: 8, gridHeight: 8 });
    // internal setup
    for (const boardPos in board) {
      const battleUnit = new BattleUnit(board[boardPos], f.coords(boardPos)); // maybe f.* is overhead
      units.push(battleUnit);
      this.battleBoard[boardPos] = battleUnit;
      const coordPos = {
        x: f.x(boardPos),
        y: f.y(boardPos)
      };

      this.coordsBoardMap[battleUnit.team].push(coordPos);
      this.pathfinder.occupiedTileSet.add(`${battleUnit.x},${battleUnit.y}`);
    }

    this.units = _.shuffle(units);
    this.actionQueue = new ActionQueue(this.units, this.calculateAction.bind(this));

    console.time('test');
    this.actionQueue.execute();
    this.setWinner();
    console.log(this.actionStack.length);
    console.timeEnd('test');
  }

  setWinner() {
    if (!this.coordsBoardMap[TEAM.A].length && !this.coordsBoardMap[TEAM.B].length) {
      this.winner = TEAM.NONE;
    }
    if (!this.coordsBoardMap[TEAM.A].length) {
      this.winner = TEAM.B;
    }
    if (!this.coordsBoardMap[TEAM.B].length) {
      this.winner = TEAM.A;
    }
    this.playerDamage = 5;
  }

  calculateAction({ timestamp, unit }) {
    const targetUnit = unit.getTarget();
    if (unit.canCast()) {
      // tODO
    } else if (targetUnit && targetUnit.isAlive() && unit.isTargetInRange()) {
      const attackResult = unit.doAttack(targetUnit);
      this.action(
        {
          action: ACTION_ATTACK,
          from: unit.getPosition(),
          to: targetUnit.getPosition(),
          damage: attackResult.damage
        },
        timestamp
      );

      // update board
      if (!targetUnit.isAlive()) {
        this.actionQueue.removeUnitFromQueue(targetUnit);
        this.pathfinder.occupiedTileSet.delete(`${targetUnit.x},${targetUnit.y}`);
        this.moveUnit(targetUnit, null, timestamp);
        unit.setTarget(null);
      }
    } else {
      // get target (todo use previous target if exist)
      const closestTarget = this.getClosestTarget(unit);
      unit.setTarget(closestTarget);
      if (!closestTarget) return;
      // get path to target [todo first move can be done just by direction if possible. Use pathfinder only when needed]
      const { x, y } = this.pathfinder.findPath({ x: unit.x, y: unit.y, targetX: closestTarget.x, targetY: closestTarget.y });
      this.moveUnit(unit, { x, y }, timestamp);
    }
  }

  action(actionObject, time) {
    this.actionStack.push({
      ...actionObject,
      time
    });
    return this;
  }

  /**
   * @param {BattleUnit} battleUnit
   * @param {Object/null} position if null, then removing from board
   */
  moveUnit(battleUnit, position, timestamp) {
    const fromPosition = {
      x: battleUnit.x,
      y: battleUnit.y
    };

    this.action(
      {
        action: ACTION_MOVE,
        from: fromPosition,
        to: position
      },
      timestamp
    );

    // Remove from old position, move unit itself, add to new position
    delete this.battleBoard[battleUnit.getBoardPosition()];
    if (position) {
      battleUnit.move(position);
      this.battleBoard[battleUnit.getBoardPosition()] = battleUnit;

      // update internal coords
      this.coordsBoardMap[battleUnit.team] = this.coordsBoardMap[battleUnit.team].filter(pos => pos.x !== fromPosition.x && pos.y !== fromPosition.y);
      this.coordsBoardMap[battleUnit.team].push(position);
    } else {
      this.coordsBoardMap[battleUnit.team] = this.coordsBoardMap[battleUnit.team].filter(pos => pos.x !== battleUnit.x && pos.y !== battleUnit.y);

      if (this.coordsBoardMap[battleUnit.team].length === 0) {
        // no more units left. Battle is over;
        this.isOver = true;
      }
    }

    this.pathfinder.occupiedTileSet.delete(`${fromPosition.x},${fromPosition.y}`);
    if (position) {
      this.pathfinder.occupiedTileSet.add(`${battleUnit.x},${battleUnit.y}`);
    }

    // next action is set inside monster move() [if no position, then monster is removed]
    if (position) {
      // update distance to target [TODO]
    } else if (this.coordsBoardMap[battleUnit.team].length === 0) {
      // unit was removed, so maybe its time to end the battle
      this.isOver = true;
      this.winner = battleUnit.oppositeTeam();
    }
  }

  /**
   * @todo perf this against old method after finishding direction(for_perf_kdtree.js)
   * @param {BattleUnit} battleUnit
   * @returns {BattleUnit}
   */
  getClosestTarget(battleUnit) {
    const enemiesCoords = this.coordsBoardMap[battleUnit.oppositeTeam()];
    // eslint-disable-next-line
    const tree = new kdTree(
      enemiesCoords,
      function(a, b) {
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      },
      ['x', 'y']
    );
    const AMOUNT = 1;
    const closestEnemy = tree.nearest(
      {
        x: battleUnit.x,
        y: battleUnit.y
      },
      AMOUNT
    );
    if (closestEnemy.length) {
      const targetPosition = new Position(+closestEnemy[0][0].x, +closestEnemy[0][0].y);
      const targetUnit = this.battleBoard[targetPosition.toBoardPosition()];

      if (targetUnit) {
        return targetUnit;
      }
    }

    return null;
  }
}
