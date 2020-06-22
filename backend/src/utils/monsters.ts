import { MonsterInterface } from '../monsters/abstract/Monster';
import * as monsters from '../monsters';

const randomProperty = function(obj) {
  const keys = Object.keys(obj);
  // tslint:disable-next-line: no-bitwise
  return obj[keys[(keys.length * Math.random()) << 0]];
};

interface MonstersFilter {
  cost?: number;
}

class Monsters {
  private static instance: Monsters;
  public MONSTERS: any;

  private constructor() {
    console.log('Construction monsters util');
    this.MONSTERS = {};
    Object.keys(monsters).forEach((element) => {
      const monsterName = element.toLowerCase();
      const mob = new monsters[element]();
      this.MONSTERS[monsterName] = Object.assign({
        name: monsterName,
      }, mob) as MonsterInterface;
    });
  }

  public static getInstance(): Monsters {
    if (!Monsters.instance) {
      Monsters.instance = new Monsters();
    }

    return Monsters.instance;
  }

  getAllUnits() {
    return Monsters.getInstance().MONSTERS
  }

  getMonsterStats(name) {
    return Monsters.getInstance().MONSTERS[name.toLowerCase()]
  }

  getRandomUnit(filterObject?: MonstersFilter) {
    const instance = Monsters.getInstance();
    const monsterNames = Object.keys(instance.MONSTERS);

    const filtered = {};
    for (let i = 0; i < monsterNames.length; i++) {
      const monsterName = monsterNames[i];
      const mob: MonsterInterface = instance.MONSTERS[monsterName];

      if (filterObject?.cost && mob.cost > filterObject?.cost) {
        continue;
      }

      if (mob.specialty?.shopRestricted) {
        continue;
      }

      filtered[monsterName] = mob;
    }

    return randomProperty(filtered) as MonsterInterface;
  }
}

export default Monsters.getInstance();
