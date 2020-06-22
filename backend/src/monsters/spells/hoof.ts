/** globals: this: BattleUnit */
import { BattleContext } from '../../objects/Battle';
import BattleUnit from '../../objects/BattleUnit';
import { RescheduleActorAction, ACTION_TYPE, ActionBase } from '../../objects/Action';

/** Stuns front units for `ticks` ms. */
export default function hoof(this: BattleUnit, battleContext: BattleContext) {
  // @ts-ignore
  const { ticks } = this.spell.config;
  const caster = this;
  return (function* () {
    const affectedTiles = caster.getLookingDirectionTiles(battleContext);
    const targets = battleContext.units.fromPositions(affectedTiles);
    if (!targets.size) {
      return null; // todo test
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
