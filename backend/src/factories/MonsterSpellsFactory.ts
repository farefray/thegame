import * as monsterSpells from '../configs/monsterSpells';
import BattleUnit from '../structures/BattleUnit';

class MonsterSpellsFactory {
  public static create(caster: BattleUnit) {
    return caster.spell?.name ? new monsterSpells[caster.spell?.name](caster) : null;
  }
}

export default MonsterSpellsFactory;
