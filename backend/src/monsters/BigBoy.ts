import Monster from '../abstract/Monster';
import BattleUnit from '../objects/BattleUnit';
import { Context } from '../objects/Battle';

function spell(unit: BattleUnit, battleContext: Context) {
  const manaCost = 100;
  const ticks = 20;
  const tickValue = 2000;
  const tickDelay = 1000;
  if (unit.mana < manaCost) return null;
  return (function*() {
    let counter = 0;
    yield { actions: unit.manaChange(-manaCost) };
    while (ticks > counter++) {
      yield { delay: tickDelay, actions: unit.healthChange(tickValue) };
    }
  })();
}

function BigBoy() {
  return new Monster({
    armor: 5,
    attack: 50,
    attackRange: 1,
    attackSpeed: 1000,
    cost: 1,
    lookType: 25,
    mana: 0,
    manaRegen: 10,
    maxHealth: 3750,
    speed: 1000,
    spell
  });
}

export default BigBoy;
