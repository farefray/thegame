import ActionQueue from './ActionQueue';
import Pathfinder from './Pathfinder';
import TargetPairPool from './TargetPairPool';
import pathUtils from '../utils/pathUtils';

const _ = require('lodash');

const { TEAM } = require('../../../frontend/src/shared/constants');

export default class Battle {
  constructor(board) {
    // returnable values
    this.startBoard = _.cloneDeep(board); // test if thats needed or just adding perf issues
    this.winner = null;
    this.playerDamage = 0;

    // internal setup
    const units = [];
    this.targetPairPool = new TargetPairPool();
    this.pathfinder = new Pathfinder({ gridWidth: 8, gridHeight: 8 });
    for (const boardPos in board) {
      const battleUnit = board[boardPos];

      // Using symbol property to map battle unit into current battle and stay not enumerable
      battleUnit.proxy({
        name: 'Battle',
        instance: this
      });

      units.push(battleUnit);
      this.pathfinder.occupiedTileSet.add(`${battleUnit.x},${battleUnit.y}`);
    }

    this.units = _.shuffle(units);
    this.actionQueue = new ActionQueue(this.units, this.calculateAction.bind(this), () => {
      this.setWinner();
    });

    this.actionQueue.execute();
  }

  /**
   * @description returns actionstack from 
   * completed actionQueque to be sent to frontend
   * @returns {Array} ActionStack
   */
  get actionStack() {
    return this.actionQueue.actionStack;
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
    battleUnit.lastActionTimestamp = timestamp;
    battleUnit.proceedRegeneration(timestamp);

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
    if (battleUnit.hasSpell() && battleUnit.castSpell()) {
      return;
    }

    const distanceToTarget = Pathfinder.getDistanceBetweenUnits(battleUnit, targetUnit);
    if (distanceToTarget < battleUnit.attackRange) {
      battleUnit.doAttack(targetUnit);
    } else {
      const step = this.pathfinder.findStepToTarget(battleUnit, targetUnit);
      this.moveUnit(battleUnit, step, timestamp);
    }
  }

  /**
   * Executed from BattleUnit instance once its die
   * @param {BattleUnit} battleUnit
   * @param {String} killerID
   * @memberof Battle
   */
  onUnitDeath(battleUnit, killerID) {
    this.actionQueue.removeUnitFromQueue(battleUnit);
    this.pathfinder.occupiedTileSet.delete(`${battleUnit.x},${battleUnit.y}`);

    // Updates targets for attackers right after this one died
    let affectedAttackers = this.targetPairPool.removeByUnitId(battleUnit.id).affectedAttackers;
    affectedAttackers = affectedAttackers.filter(affectedAttacker => affectedAttacker.id !== killerID);
    for (const affectedAttacker of affectedAttackers) {
      if (affectedAttacker.actionLockTimestamp >= battleUnit.lastActionTimestamp) continue;
      this.actionQueue.removeUnitFromQueue(affectedAttacker);
      this.actionQueue.addToActionQueue({ timestamp: battleUnit.lastActionTimestamp, unit: affectedAttacker });
      affectedAttacker.test = battleUnit.lastActionTimestamp + affectedAttacker.speed; // what is that .test about?
    }
  }

  getUnitClosestTarget(unit) {
    return pathUtils.getClosestTarget({ x: unit.x, y: unit.y, targets: this.units.filter(u => u.team === unit.oppositeTeam() && u.isAlive()) });
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
