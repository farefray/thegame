import * as PathUtil from '../utils/pathUtils';
import Pathfinder from './Pathfinder';
import { ACTION_TYPE, AcquireTargetAction, SpawnAction } from './Action';
import { MoveAction, AttackAction, HealthChangeAction, ManaChangeAction, DeathAction } from './Action';
import { Position } from './Position';
import Actor, { ActionGeneratorValue } from './Actor';
import { BattleContext } from './Battle';
import Monsters from '../utils/Monsters';
import { PARTICLES, IEffect, EFFECTS } from '../utils/effects';

const STARTING_DELAY = 2000; // delaying all the starting actions for frontend needs

/**
 * @description Describes base unit to be built into BattleUnit
 * @interface SimpleUnit
 */
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
  public attack: {
    value: number;
    range: number;
    speed: number;
    particle: {
      id: string | null /** particle name in case of distant attack */;
      duration: number /** attack duration for both, melee and distant attacks */;
    };
  };
  public lookType: number;
  public previousStep?: Object;
  public armor: number;
  public actionDelay: number; // TODO[P0] - this is supposed to be different, based on speed or atk speed or exhaust after spellcast?
  public spell?: Function;

  private _health: {
    now: number;
    max: number;
  };

  private _mana: {
    now: number;
    max: number;
    regen: number;
  };

  private spawned: boolean = false;

  constructor(simpleUnit: SimpleUnit) {
    this.x = +simpleUnit.position.x;
    this.y = +simpleUnit.position.y;
    this.id = this.stringifiedPosition; // id = is also a starting position for mob
    this.teamId = simpleUnit.teamId;

    const unitStats = Monsters.getMonsterStats(simpleUnit.name);
    const { attack } = unitStats;
    this.name = unitStats.name;
    this.attack = {
      ...attack,
      particle: {
        id: attack.particleID || null,
        duration: attack.particleID ? PARTICLES[attack.particleID].speed : Math.floor(attack.speed / 10)
      }
    };
    this.armor = unitStats.armor;
    this.lookType = unitStats.lookType;
    this._mana = {
      now: 0,
      max: unitStats.mana.max,
      regen: unitStats.mana.regen
    };
    this.actionDelay = unitStats.speed;
    this.spell = unitStats.spell;

    this._health = {
      now: unitStats.health.max,
      max: unitStats.health.max
    };
  }

  get position(): Position {
    return { x: this.x, y: this.y };
  }

  get stringifiedPosition(): string {
    return `${this.x},${this.y}`;
  }

  get health() {
    return this._health.now;
  }

  get maxHealth() {
    return this._health.max;
  }

  set health(value) {
    this._health.now = Math.max(0, Math.min(value, this._health.max));
  }

  get mana() {
    return this._mana.now;
  }

  set mana(value) {
    this._mana.now = Math.max(0, Math.min(value, this._mana.max));
  }

  get manaRegen() {
    return this._mana.regen;
  }

  get oppositeTeamId() {
    return 1 - this.teamId;
  }

  get isAlive() {
    return this._health.now > 0;
  }

  get attackRange() {
    return this.attack.range;
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
    yield { delay: STARTING_DELAY, actions: this.spawn() };
    yield { actors: [new Actor({ actionGenerator: this.regeneration(), timestamp: STARTING_DELAY })] };

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
        const { actions, actors } = this.doAttack(targetUnit, battleContext);
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
      yield { delay: 1000, actions: this.manaChange(this.manaRegen) };
    }

    return {};
  }

  spawn(): [SpawnAction] {
    const spawnAction: SpawnAction = {
      unitId: this.id,
      type: ACTION_TYPE.SPAWN,
      payload: { unit: this }
    };

    return [spawnAction];
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

  get attackValue() {
    const value = this.attack.value;
    const maximumRoll = Math.floor(value * 1.1);
    const minimumRoll = Math.ceil(value * 0.9);
    return Math.floor(Math.random() * (maximumRoll - minimumRoll + 1)) + minimumRoll;
  }

  isMelee() {
    return this.attackRange === 1;
  }

  /**
   * @description Delay between attack start and damage apply
   * @readonly
   * @memberof BattleUnit
   */
  attackDuration(from: Position, to: Position) {
    if (this.isMelee()) {
      return Math.round(Math.floor(this.attack.speed / 10) / 10) * 10; // based on attack speed, rounding to .*0
    }

    const speedByTile = this.attack.particle.duration / this.attackRange;
    return Math.max(
      100,
      Math.floor(
        PathUtil.getDistanceBetweenCoordinates({
          x: from.x,
          y: from.y,
          targetX: to.x,
          targetY: to.y
        }) * speedByTile
      )
    );
  }

  doAttack(targetUnit: BattleUnit, battleContext: BattleContext): { actions: [AttackAction]; actors: Actor[] } {
    // this.actionLockTimestamp = this.currentTimestamp + 100;
    const from = this.position;
    const to = targetUnit.position;
    const multiplier = 1 - (0.052 * targetUnit.armor) / (0.9 + 0.048 * targetUnit.armor);

    const attackDuration = this.attackDuration(from, to);
    const attackAction: AttackAction = {
      unitId: this.id,
      type: ACTION_TYPE.ATTACK,
      payload: {
        from,
        to,
        duration: attackDuration
      }
    };

    const value = -Math.floor(multiplier * this.attackValue);
    const actors = [
      new Actor({
        timestamp: battleContext.currentTimestamp + attackDuration,
        actionGenerator: (function*() {
          yield { actions: targetUnit.healthChange(value) };
        })()
      })
    ];

    return { actions: [attackAction], actors };
  }

  healthChange(value: number, effect?: IEffect | undefined): [HealthChangeAction] | [HealthChangeAction, DeathAction] {
    this.health += value;

    const healthChangeAction: HealthChangeAction = {
      unitId: this.id,
      type: ACTION_TYPE.HEALTH_CHANGE,
      payload: {
        value
      }
    };

    if (effect) {
      healthChangeAction.effects = [
        {
          id: effect.id,
          duration: effect.duration || EFFECTS[effect.id].duration,
          from: {
            x: this.x,
            y: this.y
          }
        }
      ];
    }

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
    this._mana.now += value;
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
    return <BattleUnit>PathUtil.getClosestTargets({
      x: this.x,
      y: this.y,
      targets: units.filter(u => u.teamId === this.oppositeTeamId && u.isAlive),
      amount: 1
    });
  }
}
