import Monster from '../../abstract/Monster';
import BattleUnit from '../../objects/BattleUnit';
import { BattleContext } from '../../objects/Battle';
import config from './Dwarf Geomancer.config.json';

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
    yield { actions: unit.manaChange(-manaCost) }; // todo fix manacost for this spell
    while (ticks > counter++) {
      yield { actionDelay: tickDelay, actions: target.healthChange(tickValue, {
        effect: { id: 'green_sparkles' },
      }) };
    }
  })();
}

function Dwarf_Geomancer() {
  return Monster({
    ...config,
    spell,
  });
}

export default Dwarf_Geomancer;
