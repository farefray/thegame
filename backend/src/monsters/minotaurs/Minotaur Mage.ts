import Monster from '../../abstract/Monster';
import BattleUnit from '../../objects/BattleUnit';
import { BattleContext } from '../../objects/Battle';
import { getSuitableTargets } from '../../utils/pathUtils';
import Actor from '../../objects/Actor';

// Example of AOE spell which hits target and neaby targets
function spell(unit: BattleUnit, battleContext: BattleContext) {
  const manaCost = 100;
  if (unit.mana < manaCost) return null;

  const targetEnemy = <BattleUnit>getSuitableTargets(unit, battleContext.units, {
    amount: 1,
    enemy: true
  });

  if (!targetEnemy) {
    return null;
  }

  const affectedUnits:BattleUnit[] = [targetEnemy];
  const nearbyEnemies = <BattleUnit[]>getSuitableTargets(targetEnemy, battleContext.units, { enemy: false, maxDistance: 1, amount: Infinity})

  if (nearbyEnemies) {
    affectedUnits.push(...nearbyEnemies);
  }

  const damageDealt = -75;
  return (function*() {
    yield { actions: unit.manaChange(-manaCost) };
    yield { delay: 0, actors: [
        new Actor({
          timestamp: battleContext.currentTimestamp,
          actionGenerator: (function*() {
            yield { actions: affectedUnits[0].healthChange(2 * damageDealt, { id: 'thunderstorm' }) }
            
            if(affectedUnits[1]) {
              for (let index = 1; index < affectedUnits.length; index++) {
                yield { actions: affectedUnits[index].healthChange(damageDealt, { id: 'blue_chain' }) }
              }
            }
          })()
        })
      ]
    }
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
      regen: 25
    },
    speed: 1200,
    spell
  });
}

export default Minotaur_Mage;
