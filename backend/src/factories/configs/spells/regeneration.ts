/** globals: this: BattleUnit */
import { BattleContext } from '../../../structures/Battle';
import BattleUnit from '../../../structures/BattleUnit';

export default function regeneration(this: BattleUnit, battleContext: BattleContext) {
  // @ts-ignore
  const { ticks, tickValue, tickDelay } = this.spell.config;

  const target = null; //battleContext.units.byTeam(this.teamId).areDamaged().random;
  if (!target) return null;

  return (function* () {
    // let counter = 0;
    // while (ticks > counter++) {
    //   yield {
    //     actionDelay: tickDelay,
    //     actions: target.healthChange(tickValue, {
    //       effect: { id: 'green_sparkles' }
    //     })
    //   };
    // }
  })();
}
