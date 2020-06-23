import { MonsterInterface } from '../monsters/configs/abstract/Monster';
import * as monsters from '../monsters/index';
import { randomProperty } from '../utils/randomProperty';

interface MonstersFilter {
  cost?: number;
}

class MonstersService {
  private static instance: MonstersService;
  private _monsters: object;

  private constructor() {
    console.log('Monsters service is being constructed.');

    this._monsters = {};
    Object.keys(monsters).forEach((element) => {
      const monsterName = element.toLowerCase();
      const mob = new monsters[element]();
      this._monsters[monsterName] = Object.assign({
        name: monsterName,
      }, mob) as MonsterInterface;
    });
  }

  public static getInstance(): MonstersService {
    if (!MonstersService.instance) {
      MonstersService.instance = new MonstersService();
    }

    return MonstersService.instance;
  }

  getAllUnits() {
    return this._monsters;
  }

  getMonsterStats(name) {
    return this._monsters[name.toLowerCase()];
  }

  getRandomUnit(filterObject?: MonstersFilter) {
    const monsterNames = Object.keys(this._monsters);

    const filtered = {};
    for (let i = 0; i < monsterNames.length; i++) {
      const monsterName = monsterNames[i];
      const mob: MonsterInterface = this._monsters[monsterName];

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

export default MonstersService;
