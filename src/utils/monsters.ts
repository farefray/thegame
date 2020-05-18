import { MonsterInterface } from '../abstract/Monster';
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
    const filtered = {};
    Object.keys(Monsters.getInstance().MONSTERS).forEach((key) => {
      const mob: MonsterInterface = Monsters.getInstance().MONSTERS[key];
      if (!filterObject
        || !filterObject?.cost
        || mob.cost <= filterObject?.cost) {
        filtered[key] = mob;
      }
    });

    return randomProperty(filtered) as MonsterInterface;
  }
}

export default Monsters.getInstance();
