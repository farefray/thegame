import { Position } from './Position';
import BattleUnit from './BattleUnit';
import { IEffect } from '../utils/effects';

export enum ACTION_TYPE {
  INIT,
  MOVE,
  ATTACK,
  CAST,
  HEALTH_CHANGE,
  MANA_CHANGE,
  REGENERATION,
  DEATH,
  SPAWN,
  ACQUIRE_TARGET,
  RESCHEDULE_ACTOR
}

interface ActionBase {
  unitID: string;
  effects?: Array<IEffect>;
  uid?: string; // in order to create relationships between actions, we may use uids
  parent?: string;
}

export interface MoveAction extends ActionBase {
  type: ACTION_TYPE.MOVE;
  payload: {
    from: Position;
    to: Position;
    stepDuration: number;
  };
}
export interface AttackAction extends ActionBase {
  type: ACTION_TYPE.ATTACK;
  payload: {
    from: Position;
    to: Position;
    duration: number;
  };
}

export interface HealthChangeAction extends ActionBase {
  type: ACTION_TYPE.HEALTH_CHANGE;
  parent?: string; // another action uid which is used as relation
  payload: {
    value: number;
  };
}

export interface ManaChangeAction extends ActionBase {
  type: ACTION_TYPE.MANA_CHANGE;
  payload: {
    value: number;
  };
}

export interface DeathAction extends ActionBase {
  type: ACTION_TYPE.DEATH;
  payload: {
    unit: BattleUnit;
  };
}

export interface SpawnAction extends ActionBase {
  type: ACTION_TYPE.SPAWN;
  payload: {
    unit: BattleUnit;
  };
}

export interface AcquireTargetAction extends ActionBase {
  type: ACTION_TYPE.ACQUIRE_TARGET;
  payload: {
    attacker: BattleUnit;
    target: BattleUnit;
  };
}

export interface RescheduleActorAction extends ActionBase {
  type: ACTION_TYPE.RESCHEDULE_ACTOR;
  payload: {
    actorId: string;
    timestamp: number;
  };
}

export type Action = MoveAction | AttackAction | HealthChangeAction | ManaChangeAction | DeathAction | AcquireTargetAction | SpawnAction | RescheduleActorAction;
