import ActionQueue from './ActionQueue';
import Pathfinder from './Pathfinder';
import BattleUnit from './BattleUnit';

const _ = require('lodash');
const f = require('../f');

const { TEAM, ACTION } = require('../../app/src/shared/constants');

export default class Battle {
  constructor(board) {
    // returnable values
    this.startBoard = _.cloneDeep(board); // test if thats needed or just adding perf issues
    this.actionStack = [];
    this.winner = null;
    this.playerDamage = 0;

    const units = [];
    this.pathfinder = new Pathfinder({ gridWidth: 8, gridHeight: 8 });
    // internal setup
    for (const boardPos in board) {
      const battleUnit = new BattleUnit(board[boardPos], f.coords(boardPos)); // maybe f.* is overhead
      units.push(battleUnit);
      this.pathfinder.occupiedTileSet.add(`${battleUnit.x},${battleUnit.y}`);
    }

    this.units = _.shuffle(units);
    this.actionQueue = new ActionQueue(this.units, this.calculateAction.bind(this));

    // console.time('test');
    this.actionQueue.execute();
    this.setWinner();
    //console.log(this.actionStack);
    // console.timeEnd('test');
  }

  setWinner() {
    const remainingUnitCount = {
      [TEAM.A]: this.units.filter(u => u.team === [TEAM.A]),
      [TEAM.B]: this.units.filter(u => u.team === [TEAM.B])
    };
    if (!remainingUnitCount[TEAM.A] && !remainingUnitCount[TEAM.B]) {
      this.winner = TEAM.NONE;
    }
    if (!remainingUnitCount[TEAM.A]) {
      this.winner = TEAM.B;
    }
    if (!remainingUnitCount[TEAM.B]) {
      this.winner = TEAM.A;
    }
    this.playerDamage = 5;
  }

  calculateAction({ timestamp, unit }) {
    let targetUnit = unit.getTarget();
    if (!targetUnit || !targetUnit.isAlive()) {
      unit.setTarget(this.getUnitClosestTarget(unit));
      targetUnit = unit.getTarget();
    }
    if (!targetUnit) return;

    const distanceToTarget = Pathfinder.getDistanceBetweenUnits(unit, targetUnit);
    if (distanceToTarget <= unit.attackRange) {
      const attackResult = unit.doAttack(targetUnit);
      this.addActionToStack(
        {
          type: ACTION.ATTACK,
          from: unit.getPosition(),
          to: targetUnit.getPosition(),
          damage: attackResult.damage
        },
        timestamp
      );

      if (!targetUnit.isAlive()) {
        this.actionQueue.removeUnitFromQueue(targetUnit);
        this.pathfinder.occupiedTileSet.delete(`${targetUnit.x},${targetUnit.y}`);
        this.moveUnit(targetUnit, null, timestamp);
      }
    } else {
      const step = this.pathfinder.findStepToTarget(unit, targetUnit);
      this.moveUnit(unit, step, timestamp);
    }
  }

  getUnitClosestTarget(unit) {
    return Pathfinder.getClosestTarget({ x: unit.x, y: unit.y, targets: this.units.filter(u => u.team === unit.oppositeTeam() && u.isAlive()) });
  }

  addActionToStack(actionObject, time) {
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
  moveUnit(battleUnit, step, timestamp) {
    const fromPosition = {
      x: battleUnit.x,
      y: battleUnit.y
    };

    const position = step && {
      x: battleUnit.x + step.x,
      y: battleUnit.y + step.y
    };

    this.addActionToStack(
      {
        type: ACTION.MOVE,
        from: fromPosition,
        to: position
      },
      timestamp
    );

    if (position) {
      battleUnit.previousStep = step;
      battleUnit.move(position);
    }

    this.pathfinder.occupiedTileSet.delete(`${fromPosition.x},${fromPosition.y}`);
    if (position) {
      this.pathfinder.occupiedTileSet.add(`${battleUnit.x},${battleUnit.y}`);
    }
  }
}
