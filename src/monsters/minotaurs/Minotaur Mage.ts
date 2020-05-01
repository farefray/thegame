import Monster from '../../abstract/Monster';
import BattleUnit from '../../objects/BattleUnit';
import config from './Minotaur Mage.json';

import { BattleContext } from '../../objects/Battle';
import { getSuitableTargets } from '../../utils/pathUtils';
import Actor from '../../objects/Actor';

// Example of AOE spell which hits target and neaby targets
function spell(unit: BattleUnit, battleContext: BattleContext) {
  const manaCost = 100;
  if (unit.mana < manaCost) return null;

  const targetEnemy = <BattleUnit>getSuitableTargets(unit, battleContext.units, {
    amount: 1,
    enemy: true,
  });

  if (!targetEnemy) {
    return null;
  }

  const affectedUnits:BattleUnit[] = [targetEnemy];
  const nearbyEnemies = <BattleUnit[]>getSuitableTargets(targetEnemy, battleContext.units, { enemy: false, maxDistance: 1, amount: Infinity });

  if (nearbyEnemies) {
    affectedUnits.push(...nearbyEnemies);
  }

  const damageDealt = -75;
  return (function*() {
    yield { actions: unit.manaChange(-manaCost) };
    yield { actionDelay: 0, actors: [
      new Actor({
          timestamp: battleContext.currentTimestamp,
          actionGenerator: (function*() {
            if (affectedUnits.length > 0) {
              yield {
                actions: affectedUnits[0].healthChange(2 * damageDealt, {
                    effect: { id: 'thunderstorm' },
                  }),
              };

              if(affectedUnits.length > 1) {
                for (let index = 1; index < affectedUnits.length; index++) {
                  yield {
                    actions: affectedUnits[index].healthChange(damageDealt, {
                      effect: { id: 'blue_chain' },
                    }),
                  };
                }
              }
            }
          })(),
        }),
    ],
    };
  })();
}

function Minotaur_Mage() {
  return Monster({ ...config, spell });
}

export default Minotaur_Mage;
