import { Action } from './Action';
import { BattleContext } from './Battle';

export interface ActionGeneratorValue {
  delay?: number;
  actions?: Action[];
  actors?: Actor[];
}
export default class Actor {
  public id: string; // todo rename to unitID or what?
  public timestamp: number;
  public actionGenerator: Generator<ActionGeneratorValue, ActionGeneratorValue, BattleContext>;

  constructor({ id = '', actionGenerator, timestamp }) {
    this.id = id;
    this.actionGenerator = actionGenerator;
    this.timestamp = timestamp;
  }
}
