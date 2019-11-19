import * as PathUtil from '../utils/pathUtils';
import Pathfinder from './Pathfinder';
import { ACTION_TYPE, AcquireTargetAction } from './Action';
import { MoveAction, AttackAction, HealthChangeAction, ManaChangeAction, DeathAction } from './Action';
import { Position } from './Position';
import Actor, { ActionGeneratorValue } from './Actor';
import { BattleContext } from './Battle';
import Monsters from '../utils/Monsters';

interface SimpleUnit {
  name: string;
  position: {
    x: number;
    y: number;
  };
  teamId: number;
}

export default class BattleUnit {
  public id: string;
  public name: string;
  public x: number;
  public y: number;
  public teamId: number;
  public attackRange: number;
  public lookType: number;
  public previousStep?: Object;
  public maxHealth: number;
  public maxMana: number;
  public armor: number;
  public actionDelay: number;
  public spell?: Function;

  private _health: number;
  private _mana: number;
  private _attack: number;

  constructor(simpleUnit: SimpleUnit) {
    this.x = +simpleUnit.position.x;
    this.y = +simpleUnit.position.y;
    this.id = this.stringifiedPosition; // id = is also a starting position for mob
    this.teamId = simpleUnit.teamId;

    const unitStats = Monsters.getMonsterStats(simpleUnit.name);
    this.name = unitStats.name;
    this.attackRange = unitStats.attackRange;
    this.armor = unitStats.armor;
    this.lookType = unitStats.lookType;
    this.maxHealth = unitStats.maxHealth;
    this.maxMana = unitStats.maxMana;
    this.actionDelay = unitStats.speed;
    this.spell = unitStats.spell;

    this._health = unitStats.maxHealth;
    this._mana = 0;
    this._attack = unitStats.attack;
  }

  get position(): Position {
    return { x: this.x, y: this.y };
  }

  get stringifiedPosition(): string {
    return `${this.x},${this.y}`;
  }

  get health() {
    return this._health;
  }

  set health(value) {
    this._health = Math.max(0, Math.min(value, this.maxHealth));
  }

  get mana() {
    return this._mana;
  }

  set mana(value) {
    this._mana = Math.max(0, Math.min(value, this.maxMana));
  }

  get oppositeTeamId() {
    return 1 - this.teamId;
  }

  get isAlive() {
    return this._health > 0;
  }

  /**
   * Moving battle unit starting position
   * @param toPosition 
   */
  rearrange(toPosition: Position) {
    this.y = toPosition.y;
    this.x = toPosition.x;
    this.id = this.stringifiedPosition; // we update id for this unit aswell
  }

  attemptSpellCast(battleContext: BattleContext) {
    if (!this.spell) return {};
    const spellGenerator = this.spell(this, battleContext);
    if (!spellGenerator) return {};
    const { currentTimestamp } = battleContext;
    const actor = new Actor({ timestamp: currentTimestamp, actionGenerator: spellGenerator });
    return { delay: this.actionDelay, actors: [actor] };
  }

  *actionGenerator(): Generator<ActionGeneratorValue, ActionGeneratorValue, BattleContext> {
    yield { actors: [new Actor({ actionGenerator: this.regeneration(), timestamp: 0 })] };
    while (this.isAlive) {
      const battleContext = yield {};
      const { targetPairPool, pathfinder, units } = battleContext;

      yield this.attemptSpellCast(battleContext);

      let targetUnit = targetPairPool.findTargetByUnitId(this.id);
      const closestTarget = this.getClosestTarget(units);
      if (!targetUnit || Pathfinder.getDistanceBetweenUnits(this, closestTarget) < Pathfinder.getDistanceBetweenUnits(this, targetUnit)) {
        yield { actions: closestTarget ? this.acquireTarget(closestTarget) : undefined }; // had to use those ? val : undefined in order to compile backend, however this has to be solved properly by typescript magic :)
        targetUnit = closestTarget;
      }

      if (!targetUnit) {
        yield { delay: this.actionDelay };
        continue;
      }
      const distanceToTarget = Pathfinder.getDistanceBetweenUnits(this, targetUnit);
      if (distanceToTarget < this.attackRange) {
        const { actions, actors } = this.attack(targetUnit, battleContext);
        yield { delay: this.actionDelay, actions, actors };
      } else {
        const step = pathfinder.findStepToTarget(this, targetUnit);
        yield { delay: this.actionDelay, actions: this.move(step) };
      }
    }
    return {};
  }

  *regeneration(): Generator<ActionGeneratorValue, ActionGeneratorValue, BattleContext> {
    while (this.isAlive) {
      yield { delay: 1000, actions: this.manaChange(10) };
    }
    return {};
  }

  move(step: Position): [MoveAction] {
    this.previousStep = step;
    // this.actionLockTimestamp = this.proxied('actionQueue').currentTimestamp + this.speed;

    const from = this.position;
    this.x += step.x;
    this.y += step.y;
    const to = this.position;
    return [
      {
        unitId: this.id,
        type: ACTION_TYPE.MOVE,
        payload: {
          from,
          to
        }
      }
    ];
  }

  attack(targetUnit: BattleUnit, battleContext: BattleContext): { actions: [AttackAction]; actors: Actor[] } {
    // this.actionLockTimestamp = this.currentTimestamp + 100;
    const from = this.position;
    const to = targetUnit.position;

    const multiplier = 1 - (0.052 * targetUnit.armor) / (0.9 + 0.048 * targetUnit.armor);
    const maximumRoll = Math.floor(this._attack * 1.1);
    const minimumRoll = Math.ceil(this._attack * 0.9);
    const value = -Math.floor(multiplier * Math.floor(Math.random() * (maximumRoll - minimumRoll + 1)) + minimumRoll);

    const attackAction: AttackAction = {
      unitId: this.id,
      type: ACTION_TYPE.ATTACK,
      payload: {
        from,
        to
      }
    };

    const actors = [
      new Actor({
        timestamp: battleContext.currentTimestamp + this.actionDelay / 2,
        actionGenerator: (function*() {
          yield { actions: targetUnit.healthChange(value) };
        })()
      })
    ];

    return { actions: [attackAction], actors };
  }

  healthChange(value: number): [HealthChangeAction] | [HealthChangeAction, DeathAction] {
    this.health += value;

    const healthChangeAction: HealthChangeAction = {
      unitId: this.id,
      type: ACTION_TYPE.HEALTH_CHANGE,
      payload: {
        value
      }
    };

    if (!this.isAlive) {
      const deathAction: DeathAction = {
        unitId: this.id,
        type: ACTION_TYPE.DEATH,
        payload: { unit: this }
      };
      return [healthChangeAction, deathAction];
    }
    return [healthChangeAction];
  }

  manaChange(value: number): [ManaChangeAction] {
    this.mana += value;
    const manaChangeAction: ManaChangeAction = {
      unitId: this.id,
      type: ACTION_TYPE.MANA_CHANGE,
      payload: {
        value
      }
    };
    return [manaChangeAction];
  }

  acquireTarget(target: BattleUnit): [AcquireTargetAction] {
    return [
      {
        unitId: this.id,
        type: ACTION_TYPE.ACQUIRE_TARGET,
        payload: {
          attacker: this,
          target
        }
      }
    ];
  }

  getClosestTarget(units) {
    return PathUtil.getClosestTarget({ x: this.x, y: this.y, targets: units.filter(u => u.teamId === this.oppositeTeamId && u.isAlive) });
  }
}
