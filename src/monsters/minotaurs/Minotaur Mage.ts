import Monster from '../../abstract/Monster';
import BattleUnit from '../../objects/BattleUnit';
import { BattleContext } from '../../objects/Battle';

function spell(unit: BattleUnit, battleContext: BattleContext) {
  const manaCost = 100;
  const tickValue = -150;

  const possibleTargets = battleContext.units.filter(u => u.teamId !== unit.teamId && u.isAlive && u.health < u.maxHealth);
  const target = possibleTargets.length && possibleTargets[0];
  if (unit.mana < manaCost || !target) return null;

  return (function*() {
    yield { actions: unit.manaChange(-manaCost) };
    yield { delay: 0, actions: target.healthChange(tickValue, { id: 'thunderstorm' }) };
  })();
}

function Minotaur_Mage() {
  return Monster({
    attack: {
      value: 40,
      range: 3,
      speed: 100,
      particleID: 'fireball'
    },
    armor: 2,
    cost: 3,
    lookType: 23,
    health: {
      max: 650
    },
    mana: {
      regen: 7
    },
    speed: 1200,
    spell
  });
}

export default Minotaur_Mage;
