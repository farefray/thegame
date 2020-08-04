import BattleUnit from '../../structures/BattleUnit';
import { RescheduleActorAction, ACTION_TYPE, ActionBase } from '../../typings/Action';
import { BattleContext } from '../../typings/Battle';
import { MonsterSpell } from '../../structures/abstract/MonsterSpell';


/** Stuns front units for `ticks` ms. */
export default class Hoof extends MonsterSpell {
  constructor(caster: BattleUnit) {
    super(caster);
  }

  cast(battleContext: BattleContext) {
    const { ticks } = this.config;
    if (!ticks) {
      return null;
    }

    const caster = this.caster;
    return (function* () {
      const affectedTiles = caster.getLookingDirectionTiles(battleContext);
      const targets = battleContext.units.fromPositions(affectedTiles);
      if (!targets.size) {
        return null;
      }

      const actions: ActionBase[] = [];
      targets.forEach(unit => {
        const rescheduleActorAction: RescheduleActorAction = {
          unitID: unit.id,
          type: ACTION_TYPE.RESCHEDULE_ACTOR,
          payload: {
            targetId: unit.id,
            timestamp: ticks
          },
          effects: [{
            id: 'stars',
            duration: ticks,
            from: {
              x: unit.x,
              y: unit.y
            }
          }]
        };

        actions.push(rescheduleActorAction);
      });

      // if spell properly casted, add spell effects
      const effects: ActionBase['effects'] = [];
      affectedTiles.forEach((position) => {
        effects.push({
          id: 'poff',
          duration: 500,
          from: {
            x: position.x,
            y: position.y
          }
        });
      })

      actions.push({
        unitID: caster.id,
        effects
      })

      yield {
        actions
      };
    })();
  }
}
