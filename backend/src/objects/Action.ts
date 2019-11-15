import { Position } from './Position';
import BattleUnit from './BattleUnit';

export enum ACTION_TYPE {
  INIT,
  MOVE,
  ATTACK,
  CAST,
  HEALTH_CHANGE,
  MANA_CHANGE,
  REGENERATION,
  DEATH,
  ACQUIRE_TARGET
}

interface ActionBase {
  unitId: string;
}

export interface MoveAction extends ActionBase {
  type: ACTION_TYPE.MOVE;
  payload: {
    from: Position;
    to: Position;
  };
}
export interface AttackAction extends ActionBase {
  type: ACTION_TYPE.ATTACK;
  payload: {
    from: Position;
    to: Position;
  };
}

export interface HealthChangeAction extends ActionBase {
  type: ACTION_TYPE.HEALTH_CHANGE;
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

export interface AcquireTargetAction extends ActionBase {
  type: ACTION_TYPE.ACQUIRE_TARGET;
  payload: {
    attacker: BattleUnit;
    target: BattleUnit;
  };
}

export type Action = MoveAction | AttackAction | HealthChangeAction | DeathAction | AcquireTargetAction;
