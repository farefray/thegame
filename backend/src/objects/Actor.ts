import { Action } from './Action';
import { Context } from './Battle';

export interface ActionGeneratorValue {
  delay?: number;
  actions?: Action[];
  actors?: Actor[];
}
export default class Actor {
  public id: string;
  public timestamp: number;
  public actionGenerator: Generator<ActionGeneratorValue, ActionGeneratorValue, Context>;

  constructor({ id = '', actionGenerator, timestamp }) {
    this.id = id;
    this.actionGenerator = actionGenerator;
    this.timestamp = timestamp;
  }
}
