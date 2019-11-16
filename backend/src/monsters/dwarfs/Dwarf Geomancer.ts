import Monster from '../../abstract/Monster';
import BattleUnit from '../../objects/BattleUnit';
import { Context } from '../../objects/Battle';

function spell(unit: BattleUnit, battleContext: Context) {
  const manaCost = 100;
  const ticks = 20;
  const tickValue = 2000;
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
  return new Monster({
    armor: 1,
    attack: 40,
    attackRange: 3,
    attackSpeed: 900,
    cost: 3,
    lookType: 66,
    mana: 0,
    manaRegen: 20,
    maxHealth: 550,
    particle: 1,
    speed: 1400,
    spell
  });
}

export default Dwarf_Geomancer;
