import { getClosestTarget } from '../utils/pathUtils.ts';
import Pathfinder from './Pathfinder';
import { ACTION_TYPE } from './Action';
import { MoveAction, AttackAction, HealthChangeAction, DeathAction } from './Action';
import { Position } from './Position';
import Actor, { ActionGeneratorValue } from './Actor';
import { Context } from './Battle';

export default class BattleUnit {
  public id: string;
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

  private _health: number;
  private _mana: number;
  private _attack: number;

  constructor(unit, coords, teamId) {
    this.x = +coords.x;
    this.y = +coords.y;
    this.id = this.stringifiedPosition; // id = is also a starting position for mob
    this.teamId = teamId;

    this.attackRange = unit.attackRange;
    this.armor = unit.armor;
    this.lookType = unit.lookType;
    this.maxHealth = unit.maxHealth;
    this.maxMana = unit.maxMana;
    this.actionDelay = unit.speed;

    this._health = unit.maxHealth;
    this._mana = 0;
    this._attack = unit.attack;
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

  *actionGenerator(): Generator<ActionGeneratorValue, ActionGeneratorValue, Context> {
    while (this.isAlive) {
      const battleContext = yield {};
      const { targetPairPool, pathfinder, units } = battleContext;
      let targetUnit = targetPairPool.findTargetByUnitId(this.id);
      if (!targetUnit) {
        const closestTarget = getClosestTarget({ x: this.x, y: this.y, targets: units.filter(u => u.teamId === this.oppositeTeamId && u.isAlive) });
        if (closestTarget) {
          targetUnit = closestTarget;
          targetPairPool.add({ attacker: this, target: targetUnit });
        }
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

  attack(targetUnit: BattleUnit, battleContext: Context): { actions: [AttackAction]; actors: Actor[] } {
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
}
