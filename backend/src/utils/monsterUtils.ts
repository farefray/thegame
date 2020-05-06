import { MonsterInterface } from '../abstract/Monster';
import * as monsters from '../monsters/loader';

const MONSTERS = {};
Object.keys(monsters.default).forEach((element) => {
  const monsterName = element.toLowerCase();
  const mob = monsters.default[element]();
  MONSTERS[monsterName] = Object.assign({
    name: monsterName,
  }, mob) as MonsterInterface;
});

const randomProperty = function(obj) {
  const keys = Object.keys(obj);
  // tslint:disable-next-line: no-bitwise
  return obj[keys[(keys.length * Math.random()) << 0]];
};

interface MonstersFilter {
  cost?: number;
}

const monsterUtils = {
  getAllUnits: () => MONSTERS,
  getMonsterStats: name => MONSTERS[name.toLowerCase()],
  getRandomUnit: (filterObject: MonstersFilter) => {
    const filtered = {};
    Object.keys(MONSTERS).forEach((key) => {
      const mob: MonsterInterface = MONSTERS[key];
      if (!filterObject
        || !filterObject?.cost
        || mob.cost <= filterObject?.cost) {
        filtered[key] = mob;
      }
    });

    return randomProperty(filtered) as MonsterInterface;
  },
};

export default monsterUtils;
