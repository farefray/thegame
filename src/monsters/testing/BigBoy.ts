import Monster from '../../abstract/Monster';
import BattleUnit from '../../objects/BattleUnit';
import { BattleContext } from '../../objects/Battle';
import { RescheduleActorAction, ACTION_TYPE, Action } from '../../objects/Action';

function spell(unit: BattleUnit, battleContext: BattleContext) {
  const manaCost = 100;
  if (unit.mana < manaCost) return null;

  return (function*() {
    const actions: Action[] = [];
    actions.push(unit.manaChange(-manaCost)[0]);
    const target = battleContext.targetPairPool.findTargetByUnitId(unit.id);
    if (target) {
      // Stun
      const rescheduleActorAction: RescheduleActorAction = {
        unitID: unit.id,
        type: ACTION_TYPE.RESCHEDULE_ACTOR,
        payload: {
          actorId: target.id,
          timestamp: 3000, // 3s stun?
        },
      };
      actions.push(rescheduleActorAction);
    }
    yield { actions };
  })();
}

function BigBoy() {
  return Monster({
    armor: 5,
    attack: {
      value: 55,
      range: 1,
      speed: 1000,
    },
    cost: 3,
    lookType: 25,
    health: {
      max: 700,
    },
    mana: {
      max: 100,
      regen: 10,
    },
    walkingSpeed: 1000,
    // spell,
    specialty: {
      shopRestricted: true
    }
  });
}

export default BigBoy;
