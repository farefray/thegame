import _ from 'lodash';
import Spell from '../abstract/Spell';

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
    this._health = this.hp; // ?? why need _health
    this.maxHealth = this.hp;
    this._actionLockTimestamp = 0;
    this._regenerationTickTimestamp = 0;
    this._lastActionTimestamp = 0; // holding timestamp when last action for current unit was executed

    this.initializeSpells();
  }

  get lastActionTimestamp() {
    return this._lastActionTimestamp;
  }

  set lastActionTimestamp(value) {
    this._lastActionTimestamp = value;
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

  get regenerationTick() {
    return this._regenerationTickTimestamp;
  }

  set regenerationTick(value) {
    this._regenerationTickTimestamp = value;
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

  /**
   * @description mapping some higher order structure into battle unit to have a not enumerable link
   * @param {Object} higherOrderComponent
   * @memberof BattleUnit
   */
  proxy(higherOrderComponent) {
    // Symbolic link to bigger objects in memory which may be needed inside battle unit(battle, actionqueque and so on). Handling it as not enumerable, in order to not pass anywhere. Also, those links are not created during BattleUnit contructor, they are linked in higher order structures when its needed
    const proxy = Symbol.for('proxy');
    if (!this[proxy]) {
      this[proxy] = {};
    }

    this[proxy][higherOrderComponent.name] = higherOrderComponent.instance;
  }

  proxied(instance) {
    return this[Symbol.for('proxy')][instance];
  }

  addToActionStack(props) {
    return this.proxied('actionQueue').addToActionStack(this.id, props);
  }

  addSideEffect(sideEffect) {
    return this.proxied('actionQueue').addSideEffect(sideEffect);
  }

  move(step) {
    this.previousStep = step;
    this.actionLockTimestamp = this.proxied('actionQueue').currentTimestamp + this.speed;

    this.x += step.x;
    this.y += step.y;

    this.addToActionStack({
      type: ACTION.MOVE,
      to: { x: this.x, y: this.y }
    });
  }

  healthChange(value, sourceID) {
    this.health += value;
    this.addToActionStack({
      type: ACTION.HEALTH_CHANGE,
      value
    });

    if (!this.isAlive()) {
      this.proxied('Battle').onUnitDeath(this, sourceID);
    }
  }

  manaChange(value, addToActionStack = true) {
    this.mana += value;

    if (addToActionStack) {
      this.addToActionStack({
        type: ACTION.MANA_CHANGE,
        value
      });
    }
  }

  /**
   * @description Mutating both units by attacking
   * @warning Mutating objects
   */
  doAttack(targetUnit) {
    this.actionLockTimestamp = this.currentTimestamp + 100; // ?

    this.addToActionStack({
      type: ACTION.ATTACK,
      from: this.getPosition(),
      to: targetUnit.getPosition()
    });

    const multiplier = 1 - (0.052 * targetUnit.armor) / (0.9 + 0.048 * targetUnit.armor);
    const maximumRoll = Math.floor(this.attack * 1.1);
    const minimumRoll = Math.ceil(this.attack * 0.9);
    const damage = Math.floor(multiplier * Math.floor(Math.random() * (maximumRoll - minimumRoll + 1)) + minimumRoll);
    targetUnit.healthChange(-damage, this.id);
    return {
      damage
    };
  }

  proceedRegeneration(timestamp) {
    const health = this.hp;
    const mana = this.mana;

    const elapsedMilliseconds = timestamp - this.regenerationTick;
    const manaGained = Math.floor((this.manaRegen * elapsedMilliseconds) / 1000);
    const healthGained = Math.floor((this.healthRegen * elapsedMilliseconds) / 1000);

    this.mana = Math.min(mana + manaGained, this.maxMana);
    this.hp = Math.min(health + healthGained, this.maxHealth);
    this.regenerationTick = timestamp;

    // We are passing regeneration ticks into action stack which is probably leads to HUGE overload of actionstack array, but thats the only proper way to have it sync with real battle flow. This may be reconsidered if it will become a problem
    const gainedHealth = this.hp - health;
    const gainedMana = this.mana - mana;
    if (gainedHealth || gainedMana) {
      this.addToActionStack({
        type: ACTION.REGENERATION,
        from: this.getPosition(),
        health: gainedHealth,
        mana: gainedMana
      });
    }
  }

  initializeSpells() {
    if (!this.hasSpell()) return false;

    // having it in symbol so its not enumerable
    this[Symbol.for('spell')] = new Spell(this.spellconfig.name, this);
    return true;
  }

  hasSpell() {
    return !!this.spellconfig;
  }

  castSpell() {
    // generic checks for all spells
    const { mana: manaRequired } = this.spellconfig;
    if (this) {
      if (this.mana < manaRequired) return false;
    }

    const spell = this[Symbol.for('spell')];
    if (spell.prepare({
      units: this.proxied('Battle').units
    })) {
      this.addToActionStack({
        type: ACTION.CAST,
        from: this.getPosition(),
        manacost: manaRequired
      });

      this.manaChange(-manaRequired, false);
      return spell.cast();
    }

    return false;
  }
}
