import { v4 as uuidv4 } from 'uuid';
import * as PathUtil from '../utils/pathUtils';
import Pathfinder from './Pathfinder';
import { ACTION_TYPE, AcquireTargetAction, SpawnAction } from './Action';
import { MoveAction, AttackAction, HealthChangeAction, ManaChangeAction, DeathAction } from './Action';
import { Position } from './Position';
import Actor, { ActionGeneratorValue } from './Actor';
import { BattleContext } from './Battle';
import monsterUtils from '../utils/monsterUtils';
import { IEffect, EFFECTS } from '../utils/effects';

const STARTING_DELAY = 2000; // delaying all the starting actions for frontend needs

/**
 * @description Describes base unit to be built into BattleUnit
 * @interface UnitConfig
 */
export interface UnitConfig {
  name: string;
  x: number;
  y: number;
  teamId?: number;
}

interface HealthChangeOptions {
  effect?: IEffect | undefined;
  parent?: string;
}

export default class BattleUnit {
  public id: string;
  public name: string;
  public x: number;
  public y: number;
  public teamId: number | undefined;
  public attack: {
    value?: number;
    range?: number;
    speed?: number;
    particle?: {
      id: string | null /** particle name in case of distant attack */;
      duration: number /** attack duration for both, melee and distant attacks */;
    };
  };
  public lookType: number;
  public previousStep?: Object;
  public armor: number;
  public spell?: Function;
  public cost: number;
  public isTargetable: boolean;
  public isPassive: boolean;
  public walkingSpeed: number;

  private _health: {
    now: number;
    max: number;
  };

  private _mana?: {
    now: number;
    max: number;
    regen: number;
  };

  constructor(unitConfig: UnitConfig) {
    this.x = +unitConfig.x;
    this.y = +unitConfig.y;
    this.id = this.stringifiedPosition; // id = is also a starting position for mob
    this.teamId = unitConfig.teamId;

    const unitStats = monsterUtils.getMonsterStats(unitConfig.name);

    this.name = unitStats.name;
    this.cost = unitStats.cost;

    const { attack } = unitStats;

    this.attack = {
      ...attack,
    };

    if (attack.particleID) {
      attack.particle = {
        id: attack.particleID || null,
        duration: Math.floor(attack.speed / 10), // todo isnt this supposed to be varying on distance/atkspeed?
      };
    }

    this.armor = unitStats.armor;
    this.lookType = unitStats.lookType;

    if (unitStats.mana) {
      this._mana = {
        now: 0,
        max: unitStats.mana.max || 0,
        regen: unitStats.mana.regen || 0,
      };
    }

    this.spell = unitStats.spell;

    this._health = {
      now: unitStats.health.max,
      max: unitStats.health.max,
    };

    this.walkingSpeed = unitStats.walkingSpeed;

    this.isTargetable = unitStats?.specialty?.targetable !== undefined ? unitStats.specialty.targetable : true;
    this.isPassive = unitStats?.specialty?.passive !== undefined ? unitStats.specialty.passive : false;
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

  get maxMana() {
    return this._mana?.max ? this._mana.max : 0;
  }

  set health(value) {
    this._health.now = Math.max(0, Math.min(value, this._health.max));
  }

  get mana(): number {
    return this._mana?.now || 0;
  }

  set mana(value: number) {
    if (this._mana) {
      this._mana.now = Math.max(0, Math.min((value || 0), this._mana.max));
    }
  }

  get manaRegen() {
    return this._mana?.regen ? this._mana.regen : 0;
  }

  get oppositeTeamId() {
    switch (this.teamId) {
      case 0: {
        return 1;
      }
      case 1: {
        return 0;
      }
      case 3:
      default: {
        return null;
      }
    }
  }

  get isAlive() {
    return this._health.now > 0;
  }

  get attackRange() {
    return this.attack?.range;
  }

  get canMove() {
    return this.walkingSpeed > 0; // todo figure out stuns maybe here?
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
    return {
      actionDelay: 1000, // [TODO] check if thats fine to have 1s delay after spellcast
      actors: [actor],
    };
  }

  *unitLifeCycleGenerator(): Generator<ActionGeneratorValue, ActionGeneratorValue, BattleContext> {
    yield { actionDelay: STARTING_DELAY, actions: this.spawn() };
    yield { actors: [new Actor({ actionGenerator: this.regeneration(), timestamp: STARTING_DELAY })] };

    while (this.isAlive) {
      const battleContext = yield {};
      const { targetPairPool, pathfinder, units } = battleContext;

      yield this.attemptSpellCast(battleContext); // maybe we need to acquire target before spell cast?

      if (this.isPassive) {
        return {};
      }

      let targetUnit = targetPairPool.findTargetByUnitId(this.id); // ? :)
      const closestTarget = this.getClosestTarget(units);
      if (closestTarget && (!targetUnit || Pathfinder.getDistanceBetweenUnits(this, closestTarget) < Pathfinder.getDistanceBetweenUnits(this, targetUnit))) {
        yield { actions: this.acquireTarget(closestTarget) };
        targetUnit = closestTarget;
      }

      if (!targetUnit) {
        // Unit has no target to attack, try again in next tick with delay
        yield { actionDelay: 1000 };
        continue;
      }

      const distanceToTarget = Pathfinder.getDistanceBetweenUnits(this, targetUnit);
      if (this.attackRange && distanceToTarget < this.attackRange && this?.attack?.speed) {
        const { actions, actors } = this.doAttack(targetUnit, battleContext);
        yield {
          actionDelay: this.attack.speed,
          actions,
          actors,
        };
      } else if (this.canMove) {
        const step = pathfinder.findStepToTarget(this, targetUnit);
        yield {
          actionDelay: this.stepDuration,
          actions: this.doMove(step),
        };
      }

      /**
       * Unit is just idling on the field(f.e. stone?)
       * this actually works as lifecycle delay for neuthral units and those who dont have anything to do
       * its very performance hungry and may be a threat.
       * If unit is actually stuck or somehow bypassed 'isPassive' property, then this gonna ruin battle generation
       * [P1] should be rewised
       */
      yield { actionDelay: 0 };
    }

    return {};
  }

  *regeneration(): Generator<ActionGeneratorValue, ActionGeneratorValue, BattleContext> {
    while (this.isAlive && this.maxMana > 0 && this.mana !== this.maxMana) {
      yield { actionDelay: 1000, actions: this.manaChange(this.manaRegen) };
    }

    return {};
  }

  spawn(): [SpawnAction] {
    const spawnAction: SpawnAction = {
      unitID: this.id,
      type: ACTION_TYPE.SPAWN,
      payload: { unit: this },
    };

    return [spawnAction];
  }

  get stepDuration() {
    // slow and root conditions may be introduced here
    return this.walkingSpeed;
  }

  doMove(step: Position): [MoveAction] {
    this.previousStep = step;

    const from = this.position;
    this.x += step.x;
    this.y += step.y;
    const to = this.position;
    return [
      {
        unitID: this.id,
        type: ACTION_TYPE.MOVE,
        payload: {
          from,
          to,
          stepDuration: this.stepDuration,
        },
      },
    ];
  }

  get attackValue() {
    const value = this.attack.value;
    if (value && value > 0) {
      const minRoll = Math.ceil(value * 0.9);
      return Math.floor(Math.random() * (Math.floor(value * 1.1) - minRoll + 1)) + minRoll;
    }

    return 0;
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
    if (this.isMelee() && this.attack.speed) {
      return Math.round(Math.floor(this.attack.speed / 10) / 10) * 10; // based on attack speed, rounding to .*0
    }

    if (this.attack.particle?.duration && this.attackRange) {
      const speedByTile = this.attack.particle.duration / this.attackRange;
      return Math.max(
        250,
        Math.floor(
          PathUtil.getDistanceBetweenCoordinates({
            x: from.x,
            y: from.y,
            x2: to.x,
            y2: to.y,
          }) * speedByTile,
        ),
      );
    }

    return 0;
  }

  doAttack(targetUnit: BattleUnit, battleContext: BattleContext): { actions: [AttackAction]; actors: Actor[] } {
    const from = this.position;
    const to = targetUnit.position;
    const multiplier = 1 - (0.052 * targetUnit.armor) / (0.9 + 0.048 * targetUnit.armor);

    const attackDuration = this.attackDuration(from, to);
    const attackAction: AttackAction = {
      unitID: this.id,
      uid: uuidv4(),
      type: ACTION_TYPE.ATTACK,
      payload: {
        from,
        to,
        duration: attackDuration,
      },
    };

    const value = -Math.floor(multiplier * this.attackValue);
    return {
      actions: [attackAction], actors: [
        new Actor({
          timestamp: battleContext.currentTimestamp + attackDuration,
          actionGenerator: (function*() {
            yield {
              actions: targetUnit.healthChange(value, {
                parent: attackAction.uid,
              }),
            };
          })(),
        }),
      ],
    };
  }

  healthChange(value: number, opts?: HealthChangeOptions): [HealthChangeAction] | [HealthChangeAction, DeathAction] {
    this.health += value;

    const healthChangeAction: HealthChangeAction = {
      unitID: this.id,
      type: ACTION_TYPE.HEALTH_CHANGE,
      payload: {
        value,
      },
    };

    if (opts?.effect) {
      healthChangeAction.effects = [
        {
          id: opts.effect.id,
          duration: opts.effect.duration || EFFECTS[opts.effect.id].duration,
          from: {
            x: this.x,
            y: this.y,
          },
        },
      ];
    }

    if (opts?.parent) {
      healthChangeAction.parent = opts.parent;
    }

    if (!this.isAlive) {
      healthChangeAction.uid = uuidv4();

      const deathAction: DeathAction = {
        unitID: this.id,
        type: ACTION_TYPE.DEATH,
        payload: { unit: this },
        parent: healthChangeAction.uid,
      };


      return [healthChangeAction, deathAction];
    }

    return [healthChangeAction];
  }

  manaChange(value: number): Array<ManaChangeAction> {
    if (!this.mana || +value === 0 || this._mana?.max === this.mana) {
      return [];
    }

    this.mana += value;
    const manaChangeAction: ManaChangeAction = {
      unitID: this.id,
      type: ACTION_TYPE.MANA_CHANGE,
      payload: {
        value,
      },
    };
    return [manaChangeAction];
  }

  acquireTarget(target: BattleUnit): [AcquireTargetAction] {
    return [
      {
        unitID: this.id,
        type: ACTION_TYPE.ACQUIRE_TARGET,
        payload: {
          attacker: this,
          target,
        },
      },
    ];
  }

  getClosestTarget(units) {
    const closestTarget = <BattleUnit[]>PathUtil.getClosestTargets({
      x: this.x,
      y: this.y,
      targets: units.filter(u => u.teamId !== this.teamId && u.isAlive && u.isTargetable),
      amount: 1,
    });

    return closestTarget.length > 0 ? closestTarget[0]: null;
  }
}
