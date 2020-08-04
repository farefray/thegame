import BattleUnit, { SpellOptions } from "../BattleUnit";
import { BattleContext } from "../../typings/Battle";

export abstract class MonsterSpell {
  protected caster: BattleUnit;
  protected config: SpellOptions;

  constructor(caster: BattleUnit) {
    this.caster = caster;
    this.config = caster.spell ?? {} as SpellOptions;
  }

  abstract cast(battleContext: BattleContext)
}
