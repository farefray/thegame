import { v4 as uuidv4 } from 'uuid';
import * as PathUtil from '../utils/pathUtils';
import Pathfinder from './Battle/Pathfinder';
import { ACTION_TYPE, AcquireTargetAction, SpawnAction } from '../typings/Action';
import { MoveAction, AttackAction, HealthChangeAction, ManaChangeAction, DeathAction, CastAction } from '../typings/Action';
import Actor, { ActionGeneratorValue } from '../typings/Actor';
import { IEffect, EFFECTS } from '../utils/effects';
import { DIRECTION } from '../shared/constants';
import Position from '../shared/Position';
import Step from './Battle/Pathfinder/Step';
import { MonsterInterface } from '../typings/Monster';
import { BattleContext } from '../typings/Battle';
import MonsterSpellsFactory from '../factories/MonsterSpellsFactory';
import { MonsterSpell } from './abstract/MonsterSpell';

const STARTING_DELAY = 2000; // delaying all the starting actions for frontend needs
const MAX_MANA = 100;

interface ActionOptions {
  parent?: string;
}
interface HealthChangeOptions extends ActionOptions {
  effect?: IEffect | undefined;
}

interface ManaChangeOptions extends ActionOptions { }

export interface SpellOptions {
  manacost: number;
  name: string;
  ticks?: number;
  tickValue?: number;
  tickDelay?: number;
  effectId?: string;
}

export default class BattleUnit {
  public id: string = '';
  public name: string;
  public x: number = -1;
  public y: number = -1;
  public teamId: number = -1;
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
  public previousStep?: Step;
  public armor: number;
  public spell?: SpellOptions;
  public cost: number;
  public isTargetable: boolean;
  public isPassive: boolean;
  public isShopRestricted: boolean;
  public walkingSpeed: number;
  private spriteSize: number; // for frontend representation
  private monsterSpell?: MonsterSpell;

  private _health: {
    now: number;
    max: number;
  };

  private _mana?: {
    now: number;
    max: number;
    regen: number;
  };

  constructor(monsterConfig: MonsterInterface) {
    const unitName = monsterConfig?.name || 'Unknown monster';

    this.name = unitName;
    this.cost = monsterConfig.cost;

    this.attack = {
      ...monsterConfig.attack
    };

    if (monsterConfig.attack && monsterConfig.attack.particleID) {
      this.attack.particle = {
        id: monsterConfig.attack?.particleID || null,
        duration: Math.floor((monsterConfig.attack?.speed ?? 0) / 10) // todo isnt this supposed to be varying on distance/atkspeed?
      };
    }

    this.armor = monsterConfig.armor ?? 0;
    this.lookType = monsterConfig.lookType;

    if (monsterConfig.mana) {
      this._mana = {
        now: 0,
        max: MAX_MANA,
        regen: monsterConfig.mana.regen || 0
      };
    }

    this.spell = monsterConfig.spell; // todo destruction

    this._health = {
      now: monsterConfig.health.max,
      max: monsterConfig.health.max
    };

    this.walkingSpeed = monsterConfig.walkingSpeed ?? 0;
    this.spriteSize = monsterConfig.spriteSize ?? 1;

    this.isTargetable = monsterConfig?.specialty?.targetable !== undefined ? monsterConfig.specialty.targetable : true;
    this.isPassive = monsterConfig?.specialty?.passive !== undefined ? monsterConfig.specialty.passive : false;
    this.isShopRestricted = !!monsterConfig?.specialty?.shopRestricted;

    if (this.spell?.name) {
      this.monsterSpell = MonsterSpellsFactory.create(this);
    }
  }


  toSocket() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      teamId: this.teamId,
      attack: {
        value: this.attack.value,
        range: this.attack.range,
        speed: this.attack.speed,
        particle: {
          id: this.attack?.particle?.id,
          duration: this.attack?.particle?.duration
        }
      },
      lookType: this.lookType,
      armor: this.armor,
      cost: this.cost,
      spriteSize: this.spriteSize,
      health: this.maxHealth,
      manaRegen: this.manaRegen
    };
  }

  get position(): Position {
    return new Position(this.x, this.y);
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
      this._mana.now = Math.max(0, Math.min(value || 0, this._mana.max));
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
    return this.attack?.range ?? 1;
  }

  get canMove() {
    return this.walkingSpeed > 0; // todo figure out stuns maybe here?
  }

  get stepDuration() {
    // slow and root conditions may be introduced here
    return this.walkingSpeed;
  }

  get attackValue() {
    const value = this.attack.value;
    if (value && value > 0) {
      const minRoll = Math.ceil(value * 0.9);
      return Math.floor(Math.random() * (Math.floor(value * 1.1) - minRoll + 1)) + minRoll;
    }

    return 0;
  }

  set team(value) {
    this.teamId = value;
  }

  rearrangeToPos(pos: Position) {
    this.y = pos.y;
    this.x = pos.x;
    this.id = this.stringifiedPosition; // we update id for this unit aswell
  }

  attemptSpellCast(battleContext: BattleContext) {
    if (!this.monsterSpell || !this.spell || this.mana < this.spell.manacost) return {};

    const spellActionGenerator = this.monsterSpell.cast(battleContext);
    if (!spellActionGenerator) return {};

    const castAction: CastAction = {
      unitID: this.id,
      uid: uuidv4(),
      type: ACTION_TYPE.CAST,
      spellName: this.spell.name
    };

    return {
      actions: [castAction, ...this.manaChange(-(this.spell?.manacost || this.mana), {
        parent: castAction.uid
      })],
      actors: [
        new Actor({
          timestamp: battleContext.currentTimestamp,
          actionGenerator: spellActionGenerator
        })
      ],
      actionDelay: 1000
    };
  }

  *unitLifeCycleGenerator(): Generator<ActionGeneratorValue, ActionGeneratorValue, BattleContext> {
    yield { actionDelay: STARTING_DELAY, actions: this.spawn() };
    yield { actors: [new Actor({ actionGenerator: this.regeneration(), timestamp: STARTING_DELAY })] };

    while (this.isAlive) {
      const battleContext = yield {};
      const { targetPairPool, pathfinder, units } = battleContext;

      yield this.attemptSpellCast(battleContext);

      if (this.isPassive) {
        return {};
      }

      let targetUnit = targetPairPool.findTargetByUnitId(this.id);
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
      if (distanceToTarget < this.attackRange && this?.attack?.speed) {
        const { actions, actors } = this.doAttack(targetUnit, battleContext);
        yield {
          actionDelay: this.attack.speed,
          actions,
          actors
        };
      } else if (this.canMove) {
        const step = pathfinder.findStepToTarget(this, targetUnit);
        yield {
          actionDelay: this.stepDuration,
          actions: this.doMove(step)
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
    while (this.isAlive && this.manaRegen > 0) {
      yield { actionDelay: 1000, actions: this.manaChange(this.manaRegen) };
    }

    return {};
  }

  spawn(): [SpawnAction] {
    const spawnAction: SpawnAction = {
      unitID: this.id,
      type: ACTION_TYPE.SPAWN,
      payload: { unit: this }
    };

    return [spawnAction];
  }

  doMove(step: Step): [MoveAction] {
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
          stepDuration: this.stepDuration
        }
      }
    ];
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
            y2: to.y
          }) * speedByTile
        )
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
        duration: attackDuration
      }
    };

    const value = -Math.floor(multiplier * this.attackValue);
    return {
      actions: [attackAction],
      actors: [
        new Actor({
          timestamp: battleContext.currentTimestamp + attackDuration,
          actionGenerator: (function* () {
            yield {
              actions: targetUnit.healthChange(value, {
                parent: attackAction.uid
              })
            };
          })()
        })
      ]
    };
  }

  healthChange(value: number, opts?: HealthChangeOptions): [HealthChangeAction] | [HealthChangeAction, DeathAction] {
    this.health += value;

    const healthChangeAction: HealthChangeAction = {
      unitID: this.id,
      type: ACTION_TYPE.HEALTH_CHANGE,
      payload: {
        value
      }
    };

    if (opts?.effect) {
      healthChangeAction.effects = [
        {
          id: opts.effect.id,
          duration: opts.effect.duration || EFFECTS[opts.effect.id].duration,
          from: {
            x: this.x,
            y: this.y
          }
        }
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
        parent: healthChangeAction.uid
      };

      return [healthChangeAction, deathAction];
    }

    return [healthChangeAction];
  }

  manaChange(value: number, opts?: ManaChangeOptions): Array<ManaChangeAction> {
    if (this.mana === undefined
      || +value === 0
      || (value > 0 && this.maxMana === this.mana)) {
      return [];
    }

    this.mana += value;
    const manaChangeAction: ManaChangeAction = {
      unitID: this.id,
      type: ACTION_TYPE.MANA_CHANGE,
      payload: {
        value
      }
    };

    if (opts?.parent) {
      manaChangeAction.parent = opts.parent;
    }

    return [manaChangeAction];
  }

  acquireTarget(target: BattleUnit): [AcquireTargetAction] {
    return [
      {
        unitID: this.id,
        type: ACTION_TYPE.ACQUIRE_TARGET,
        payload: {
          attacker: this,
          target
        }
      }
    ];
  }

  getDirectionToTarget(battleContext: BattleContext) {
    const { targetPairPool } = battleContext;
    const targetUnit = targetPairPool.findTargetByUnitId(this.id);
    if (targetUnit) {
      const { x: currentX, y: currentY } = this;
      const { x: targetX, y: targetY } = targetUnit;
      if (targetX > currentX) {
        return DIRECTION.WEST;
      }

      if (targetX < currentX) {
        return DIRECTION.EAST;
      }

      if (targetY > currentY) {
        return DIRECTION.SOUTH;
      }

      if (targetY < currentY) {
        return DIRECTION.NORTH;
      }
    }

    return null;
  }

  getLookingDirectionTiles(battleContext: BattleContext) {
    const directionTiles: Array<Position> = [];
    const direction = this.getDirectionToTarget(battleContext);

    const { x: currentX, y: currentY } = this;
    switch (direction) {
      case DIRECTION.NORTH: {
        directionTiles.push(new Position(currentX - 1, currentY - 1), new Position(currentX, currentY - 1), new Position(currentX + 1, currentY - 1));
        break;
      }

      case DIRECTION.SOUTH: {
        directionTiles.push(new Position(currentX - 1, currentY + 1), new Position(currentX, currentY + 1), new Position(currentX + 1, currentY + 1));
        break;
      }

      case DIRECTION.EAST: {
        directionTiles.push(new Position(currentX - 1, currentY + 1), new Position(currentX - 1, currentY), new Position(currentX - 1, currentY - 1));
        break;
      }

      case DIRECTION.WEST: {
        directionTiles.push(new Position(currentX + 1, currentY + 1), new Position(currentX + 1, currentY), new Position(currentX + 1, currentY - 1));
        break;
      }

      default:
    }

    return directionTiles.filter(pos => pos.isValid());
  }

  getClosestTarget(units) {
    const closestTarget = <BattleUnit[]>PathUtil.getClosestTargets({
      x: this.x,
      y: this.y,
      targets: units.filter((u) => u.teamId !== this.teamId && u.isAlive && u.isTargetable),
      amount: 1
    });

    return closestTarget.length > 0 ? closestTarget[0] : null;
  }

  // AI methods
  // todo review this one
  getPreferablePosition(availableSpots: Position[]) {
    // based on attack range
    let bestMatch: Position|null = null;
    const bestX = 4; // Math.floor(Math.random() * 4) + 3
    let bestY = 3;

    if (this.attackRange > 1) {
      bestY = Math.max(0, Math.min(bestY - this.attackRange, bestY));
    }

    const allY = [0, 1, 2, 3];
    for (let index = 0; index < allY.length; index++) {
      const bestYiterator = allY.findIndex((val) => val === bestY);

      // we got chance to find best suitable position in needed Y
      let pickedY;
      if (bestYiterator !== -1) {
        pickedY = allY.splice(bestYiterator, 1).pop();
      } else {
        // all X values of preferable Y are picked, so we need to try another Y
        pickedY = bestY > 1 ? allY.pop() : allY.shift();
      }

      const xPositions = availableSpots.filter(pos => pos.y === pickedY).reduce((xValues: number[], pos) => {
        xValues.push(pos.x);
        return xValues;
      }, []);

      if (xPositions.length) {
        const bestXMatch = xPositions.reduce((prev, curr) => (Math.abs(curr - bestX) < Math.abs(prev - bestX) ? curr : prev));

        if (bestXMatch) {
          bestMatch = new Position({ x: bestXMatch, y: pickedY });
          break;
        }
      }
    }

    // todo also base to closest unit?
    if (bestMatch === null) {
      throw new Error('Cannot find free position for an unit');
    }

    return bestMatch;
  }
}
