import _ from 'lodash';
import Pathfinder from './Pathfinder';

const { ACTION } = require('../../../frontend/src/shared/constants');
/**
 * @export
 * @class BattleUnit
 */
export default class BattleUnit {
  constructor(unit, coords, team) {
    _.assign(this, unit);
    this.x = +coords.x;
    this.y = +coords.y;
    this.team = team;

    // frontend
    this.position = this.getBoardPosition(); // fixme

    // internal
    this._uid = this.getBoardPosition(); // uid = starting position for mob
    this._previousStep = null;
    this._mana = 0;
    this._health = this.hp;
    this._actionLockTimestamp = 0;
    this._previousActionTimestamp = 0;
  }

  get previousStep() {
    return this._previousStep;
  }

  set previousStep(value) {
    this._previousStep = value;
  }

  get actionLockTimestamp() {
    return this._actionLockTimestamp;
  }

  set actionLockTimestamp(value) {
    this._actionLockTimestamp = value;
  }

  get previousActionTimestamp() {
    return this._previousActionTimestamp;
  }

  set previousActionTimestamp(value) {
    this._previousActionTimestamp = value;
  }

  get health() {
    return this._health;
  }

  set health(value) {
    this._health = Math.max(0, Math.min(value, this.hp));
  }

  get mana() {
    return this._mana;
  }

  set mana(value) {
    this._mana = Math.max(0, Math.min(100, value));
  }

  get id() {
    return this._uid;
  }

  getUID() {
    return this._uid;
  }

  canCast() {
    return this.mana === this.maxMana;
  }

  oppositeTeam() {
    return 1 - this.team;
  }

  getBoardPosition() {
    return `${this.x},${this.y}`;
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y
    };
  }

  isAlive() {
    return this.health > 0;
  }

  addToActionStack(props) {
    return this.actionQueue.addToActionStack(this.id, props);
  }

  move(step) {
    this.previousStep = step;
    this.actionLockTimestamp = this.actionQueue.currentTimestamp + this.speed;

    this.x += step.x;
    this.y += step.y;

    this.addToActionStack({
      type: ACTION.MOVE,
      to: { x: this.x, y: this.y }
    });
  }

  healthChange(value) {
    this.health += value;
    this.addToActionStack({
      type: ACTION.HEALTH_CHANGE,
      value
    });
  }

  /**
   * @description Mutating both units by attacking
   * @warning Mutating objects
   */
  doAttack(targetUnit) {
    this.actionLockTimestamp = this.currentTimestamp + 100;

    this.addToActionStack({
      type: ACTION.ATTACK,
      from: this.getPosition(),
      to: targetUnit.getPosition()
    });

    const multiplier = 1 - (0.052 * targetUnit.armor) / (0.9 + 0.048 * targetUnit.armor);
    const maximumRoll = Math.floor(this.attack * 1.1);
    const minimumRoll = Math.ceil(this.attack * 0.9);
    const damage = Math.floor(multiplier * Math.floor(Math.random() * (maximumRoll - minimumRoll + 1)) + minimumRoll);
    targetUnit.healthChange(-damage);
    return {
      damage
    };
  }

  onAction(timestamp) {
    const elapsedMilliseconds = timestamp - this.previousActionTimestamp;
    const manaGained = Math.floor((this.manaRegen * elapsedMilliseconds) / 1000);
    const healthGained = Math.floor((this.healthRegen * elapsedMilliseconds) / 1000);
    this.mana += manaGained;
    this.hp += healthGained;
    this.previousActionTimestamp = timestamp;
  }

  hasSpell() {
    return !!this.spell;
  }

  /**
   *
   * @param {*} units
   * @param {*} pathfinder
   * @returns {Boolean|Object}
   * @memberof BattleUnit
   */
  canEvaluateSpell(units, pathfinder) {
    if (!this.spell) return false;
    // @todo this could be moved somewhere to spells utils or smt

    // object with requirements which later is being passed to 'doCastSpell' method, in order to not repeat requirements gathering
    const spellProps = {};

    const { requirements: req } = this.spell;
    if (req.mana && this.mana < req.mana) return false;
    spellProps.mana = req.mana || 0;

    if (req.target) {
      let target = null;
      switch (req.target.type) {
        case 'single': {
          target = Pathfinder.getClosestTarget({ x: this.x, y: this.y, targets: units.filter(u => u.team === this.oppositeTeam() && u.isAlive()) }, req.target.distance);
          break;
        }

        case 'ally': {
          target = Pathfinder.getClosestTarget({ x: this.x, y: this.y, targets: units.filter(u => u.team === this.team && u.isAlive() && u.id !== this.id) }, req.target.distance);
        }

        default:
          break;
      }

      if (!target) return false;
      spellProps.target = target;
    }

    return spellProps;
  }

  doCastSpell(spellProps) {
    this.mana -= spellProps.mana;

    const { config } = this.spell;
    if (config.target) {
      const { target } = config;
      if (target.damage) {
        spellProps.target.healthChange(-target.damage);
      }
    }

    if (config.self) {
      const { self } = config;
      if (self.damage) {
        this.healthChange(-self.damage);
      }
    }

    this.addToActionStack({
      type: ACTION.CAST,
      from: this.getPosition()
    });
  }
}
