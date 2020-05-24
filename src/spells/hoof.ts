/** globals: this: BattleUnit */
import { BattleContext } from '../objects/Battle';
import BattleUnit from '../objects/BattleUnit';
import { RescheduleActorAction, ACTION_TYPE } from '../objects/Action';

/** Stuns front units for `ticks` ms. */
export default function hoof(this: BattleUnit, battleContext: BattleContext) {
  // @ts-ignore
  const { ticks, effectId } = this.spell.config;
  const caster = this;
  return (function* () {
    // TODO display spell effect on tiles
    const affectedTiles = caster.getLookingDirectionTiles(battleContext);
    const targets = battleContext.units.fromPositions(affectedTiles);
    if (!targets.size) {
      return null; // todo test
    }

    const actions: RescheduleActorAction[] = [];
    targets.forEach(unit => {
      const rescheduleActorAction: RescheduleActorAction = {
        unitID: unit.id,
        type: ACTION_TYPE.RESCHEDULE_ACTOR,
        payload: {
          targetId: unit.id,
          timestamp: ticks
        },
        effects: [{
          id: effectId,
          duration: ticks,
          from: {
            x: unit.x,
            y: unit.y
          }
        }]
      };

      actions.push(rescheduleActorAction);
    });

    yield {
      actions
    };
  })();
}
