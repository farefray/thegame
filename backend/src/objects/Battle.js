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

    // todo refactor this
    units.forEach(unit => {
      unit.actionQueue = this.actionQueue;
    });

    // console.time('test');
    this.actionQueue.execute();
    this.actionStack = this.actionQueue.actionStack; // this is fr what?
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

  /**
   * @param {Integer, BattleUnit} { timestamp, battleUnit }
   * @returns
   * @memberof Battle
   */
  calculateAction({ timestamp, unit: battleUnit }) {
    battleUnit.onAction(timestamp);

    let targetUnit = this.targetPairPool.findTargetByUnitId(battleUnit.id);
    if (!targetUnit) {
      const closestTarget = this.getUnitClosestTarget(battleUnit);
      if (closestTarget) {
        targetUnit = closestTarget;
        this.targetPairPool.add({ attacker: battleUnit, target: targetUnit });
      }
    } else {
      const distanceToTarget = Pathfinder.getDistanceBetweenUnits(battleUnit, targetUnit);
      if (distanceToTarget > battleUnit.attackRange) {
        const closestTarget = this.getUnitClosestTarget(battleUnit);
        if (closestTarget && Pathfinder.getDistanceBetweenUnits(battleUnit, targetUnit) < distanceToTarget) {
          this.targetPairPool.remove({ attacker: battleUnit, target: targetUnit });
          targetUnit = closestTarget;
          this.targetPairPool.add({ attacker: battleUnit, target: targetUnit });
        }
      }
    }

    if (!targetUnit) return;

    // Spell casting
    if (battleUnit.hasSpell()) {
      const spellProps = battleUnit.canEvaluate(this.units, this.pathfinder, this.actionQueue);
      if (spellProps) {
        battleUnit.doCast(spellProps);
        return;
      }
    }

    const distanceToTarget = Pathfinder.getDistanceBetweenUnits(battleUnit, targetUnit);
    if (distanceToTarget < battleUnit.attackRange) {
      battleUnit.doAttack(targetUnit);
      if (!targetUnit.isAlive()) {
        this.actionQueue.removeUnitFromQueue(targetUnit);
        this.pathfinder.occupiedTileSet.delete(`${targetUnit.x},${targetUnit.y}`);

        const affectedAttackers = this.targetPairPool.removeByUnitId(targetUnit.id).affectedAttackers.filter(affectedAttacker => affectedAttacker.id !== battleUnit.id);
        for (const affectedAttacker of affectedAttackers) {
          if (affectedAttacker.actionLockTimestamp >= timestamp) continue;
          this.actionQueue.removeUnitFromQueue(affectedAttacker);
          this.actionQueue.addToActionQueue({ timestamp, unit: affectedAttacker });
          affectedAttacker.test = timestamp + affectedAttacker.speed;
        }
      }
    } else {
      const step = this.pathfinder.findStepToTarget(battleUnit, targetUnit);
      this.moveUnit(battleUnit, step, timestamp);
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
