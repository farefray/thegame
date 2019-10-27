import ActionQueue from './ActionQueue';
import Pathfinder from './Pathfinder';
import TargetPairPool from './TargetPairPool';

const _ = require('lodash');

const { TEAM, ACTION } = require('../../../frontend/src/shared/constants');

export default class Battle {
  constructor(board) {
    // returnable values
    this.startBoard = _.cloneDeep(board); // test if thats needed or just adding perf issues
    this.winner = null;
    this.playerDamage = 0;

    const units = [];
    this.actionStack = [];
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

    // xD
    units.forEach(unit => {
      unit.units = this.units;
      unit.actionQueue = this.actionQueue;
      unit.pathfinder = this.pathfinder;
    });

    // console.time('test');
    this.actionQueue.execute();
    this.actionStack = this.actionQueue.actionStack;
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
    const spellResult = unit.tryCastSpell();
    if (spellResult) {
      return;
    }

    const distanceToTarget = Pathfinder.getDistanceBetweenUnits(unit, targetUnit);
    if (distanceToTarget < unit.attackRange) {
      unit.doAttack(targetUnit);
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
   * @param {BattleUnit} unit
   * @param {Object} step position delta
   */
  moveUnit(unit, step) {
    const fromPosition = {
      x: unit.x,
      y: unit.y
    };
    unit.move(step);
    this.pathfinder.occupiedTileSet.delete(`${fromPosition.x},${fromPosition.y}`);
    this.pathfinder.occupiedTileSet.add(`${unit.x},${unit.y}`);
  }
}
