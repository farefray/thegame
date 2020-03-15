import Monster from '../abstract/Monster';
import BattleUnit from '../objects/BattleUnit';
import { BattleContext } from '../objects/Battle';
import { RescheduleActorAction, ACTION_TYPE, Action } from '../objects/Action';

function spell(unit: BattleUnit, battleContext: BattleContext) {
  const manaCost = 100;
  const ticks = 20;
  const tickValue = 2000;
  const tickDelay = 1000;
  if (unit.mana < manaCost) return null;
  return (function*() {
    let counter = 0;
    const actions: Action[] = [];
    actions.push(unit.manaChange(-manaCost)[0]);
    const target = battleContext.targetPairPool.findTargetByUnitId(unit.id);
    if (target) {
      //Stun
      const rescheduleActorAction: RescheduleActorAction = {
        unitID: unit.id,
        type: ACTION_TYPE.RESCHEDULE_ACTOR,
        payload: {
          actorId: target.id,
          timestamp: battleContext.currentTimestamp + 3000
        }
      };
      actions.push(rescheduleActorAction);
    }
    yield { actions };
    while (ticks > counter++) {
      yield { delay: tickDelay, actions: unit.healthChange(tickValue) };
    }
  })();
}

function BigBoy() {
  return Monster({
    armor: 5,
    attack: {
      value: 55,
      range: 1,
      speed: 1000
    },
    cost: 1,
    lookType: 25,
    health: {
      max: 3550
    },
    mana: {
      regen: 10
    },
    speed: 1000,
    spell
  });
}

export default BigBoy;
