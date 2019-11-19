import Monster from '../../abstract/Monster';
import BattleUnit from '../../objects/BattleUnit';
import { BattleContext } from '../../objects/Battle';

function spell(unit: BattleUnit, battleContext: BattleContext) {
  const manaCost = 100;
  const ticks = 5;
  const tickValue = 45;
  const tickDelay = 1000;
  const possibleTargets = battleContext.units.filter(u => u.teamId === unit.teamId && u.isAlive && u.health < u.maxHealth);
  const target = possibleTargets[0];
  if (unit.mana < manaCost || !target) return null;
  return (function*() {
    let counter = 0;
    yield { actions: unit.manaChange(-manaCost) };
    while (ticks > counter++) {
      yield { delay: tickDelay, actions: target.healthChange(tickValue) };
    }
  })();
}

function Dwarf_Geomancer() {
  return Monster({
    armor: 1,
    attack: {
      value: 40,
      range: 3,
      speed: 100,
      particle: 'fireball'
    },
    cost: 3,
    lookType: 66,
    mana: {
      regen: 5
    },
    health: {
      max: 550
    },
    speed: 1400,
    spell
  });
}

export default Dwarf_Geomancer;
