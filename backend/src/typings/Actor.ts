import { Action } from './Action';
import { BattleContext } from '../structures/Battle';

export interface ActionGeneratorValue {
  actionDelay?: number;
  actions?: Action[];
  actors?: Actor[];
}

export default class Actor {
  public id: string; // ? Should it be same as ActionBase.unitId?
  public timestamp: number;
  public actionGenerator: Generator<ActionGeneratorValue, ActionGeneratorValue, BattleContext>;

  constructor({ id = '', actionGenerator, timestamp }) {
    this.id = id;
    this.actionGenerator = actionGenerator;
    this.timestamp = timestamp;
  }
}
