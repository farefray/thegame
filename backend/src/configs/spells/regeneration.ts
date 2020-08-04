import BattleUnit from '../../structures/BattleUnit';
import { BattleContext } from '../../typings/Battle';
import { MonsterSpell } from '../../structures/abstract/MonsterSpell';

export default class Regeneration extends MonsterSpell {
  constructor(caster: BattleUnit) {
    super(caster);
  }

  cast(battleContext: BattleContext) {
    const { ticks, tickValue, tickDelay } = this.config;

    const target = battleContext.units.byTeam(this.caster.teamId).areDamaged().random;
    if (!target || !tickValue) return null;

    return (function* () {
      let counter = 0;
      while (ticks && ticks > counter++) {
        yield {
          actionDelay: tickDelay,
          actions: target.healthChange(tickValue, {
            effect: { id: 'green_sparkles' }
          })
        };
      }
    })();
  }
}
