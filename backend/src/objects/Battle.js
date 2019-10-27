import ActionQueue from './ActionQueue';
import Pathfinder from './Pathfinder';
import TargetPairPool from './TargetPairPool';

const _ = require('lodash');

const { TEAM, ACTION } = require('../../../frontend/src/shared/constants');

export default class Battle {
  constructor(board) {
    // returnable values
    this.startBoard = _.cloneDeep(board); // test if thats needed or just adding perf issues
    this.actionStack = [];
    this.winner = null;
    this.playerDamage = 0;

    const units = [];
    this.targetPairPool = new TargetPairPool();
    this.pathfinder = new Pathfinder({ gridWidth: 8, gridHeight: 8 });
    // internal setup
    for (const boardPos in board) {
      const battleUnit = board[boardPos];
      units.push(battleUnit);
      this.pathfinder.occupiedTileSet.add(`${battleUnit.x},${battleUnit.y}`);
    }

    this.units = _.shuffle(units);
    this.actionQueue = new ActionQueue(this.units, this.calculateAction.bind(this), () => {
      this.setWinner();
    });

    // console.time('test');
    this.actionQueue.execute();

    // console.log(this.actionStack);
    // console.timeEnd('test');
  }

  setWinner() {
    const remainingUnitCount = {
      [TEAM.A]: this.units.filter(u => u.team === TEAM.A && u.hp > 0),
      [TEAM.B]: this.units.filter(u => u.team === TEAM.B && u.hp > 0)
    };

    if (!remainingUnitCount[TEAM.A].length && !remainingUnitCount[TEAM.B].length) {
      this.winner = TEAM.NONE;
    } else {
      this.winner = !remainingUnitCount[TEAM.A].length ? TEAM.B : TEAM.A;
    }

    this.playerDamage = 5;
  }

  calculateAction({ timestamp, unit }) {
    unit.onAction(timestamp);

    let targetUnit = this.targetPairPool.findTargetByUnitId(unit.id);
    if (!targetUnit) {
      const closestTarget = this.getUnitClosestTarget(unit);
      if (closestTarget) {
        targetUnit = closestTarget;
        this.targetPairPool.add({ attacker: unit, target: targetUnit });
      }
    } else {
      const distanceToTarget = Pathfinder.getDistanceBetweenUnits(unit, targetUnit);
      if (distanceToTarget > unit.attackRange) {
        const closestTarget = this.getUnitClosestTarget(unit);
        if (closestTarget && Pathfinder.getDistanceBetweenUnits(unit, targetUnit) < distanceToTarget) {
          this.targetPairPool.remove({ attacker: unit, target: targetUnit });
          targetUnit = closestTarget;
          this.targetPairPool.add({ attacker: unit, target: targetUnit });
        }
      }
    }

    if (!targetUnit) return;
    if (unit.canCast()) {
      this.cast(unit, timestamp);
      return;
    }

    const distanceToTarget = Pathfinder.getDistanceBetweenUnits(unit, targetUnit);
    if (distanceToTarget < unit.attackRange) {
      this.attackUnit(unit, targetUnit, timestamp);
      if (!targetUnit.isAlive()) {
        this.actionQueue.removeUnitFromQueue(targetUnit);
        this.pathfinder.occupiedTileSet.delete(`${targetUnit.x},${targetUnit.y}`);

        const affectedAttackers = this.targetPairPool.removeByUnitId(targetUnit.id).affectedAttackers.filter(affectedAttacker => affectedAttacker.id !== unit.id);
        for (const affectedAttacker of affectedAttackers) {
          if (affectedAttacker.actionLockTimestamp >= timestamp) continue;
          this.actionQueue.removeUnitFromQueue(affectedAttacker);
          this.actionQueue.addToActionQueue({ timestamp, unit: affectedAttacker });
          affectedAttacker.test = timestamp + affectedAttacker.speed;
        }
      }
    } else {
      const step = this.pathfinder.findStepToTarget(unit, targetUnit);
      this.moveUnit(unit, step, timestamp);
    }
  }

  getUnitClosestTarget(unit) {
    return Pathfinder.getClosestTarget({ x: unit.x, y: unit.y, targets: this.units.filter(u => u.team === unit.oppositeTeam() && u.isAlive()) });
  }

  /**
   * @description Adds current action to actionStack to be later sent to frontend
   * @param {Object} actionObject
   * @param {Integer} time
   * @param {BattleUnit} unit
   * @memberof Battle
   */
  addActionToStack(actionObject, time, unit) {
    this.actionStack.push({
      ...actionObject,
      unitID: unit.id,
      time
    });
  }

  cast(unit, timestamp) {
    unit.mana = 0;
    this.addActionToStack(
      {
        type: ACTION.CAST,
        from: unit.getPosition()
      },
      timestamp,
      unit
    );
  }

  attackUnit(unit, targetUnit, timestamp) {
    const attackResult = unit.doAttack(targetUnit);
    unit.actionLockTimestamp = timestamp + 100;
    this.addActionToStack({ type: ACTION.TAKE_DAMAGE, damage: attackResult.damage }, timestamp, targetUnit);
    this.addActionToStack(
      {
        type: ACTION.ATTACK,
        from: unit.getPosition(),
        to: targetUnit.getPosition()
      },
      timestamp,
      unit
    );
  }

  /**
   * @param {BattleUnit} unit
   * @param {Object/null} position if null, then removing from board
   */
  moveUnit(unit, step, timestamp) {
    const fromPosition = {
      x: unit.x,
      y: unit.y
    };

    const position = {
      x: unit.x + step.x,
      y: unit.y + step.y
    };

    this.addActionToStack(
      {
        type: ACTION.MOVE,
        from: fromPosition,
        to: position
      },
      timestamp,
      unit
    );
    unit.actionLockTimestamp = timestamp + unit.speed;

    if (position) {
      unit.previousStep = step;
      unit.move(position);
    }

    this.pathfinder.occupiedTileSet.delete(`${fromPosition.x},${fromPosition.y}`);
    if (position) {
      this.pathfinder.occupiedTileSet.add(`${unit.x},${unit.y}`);
    }
  }
}
