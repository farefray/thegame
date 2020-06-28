import { MonsterInterface } from '../typings/Monster';
import * as monsters from './configs/monsters';

const DEFAULT_WALKING_SPEED = 1000;

export default class MonstersFactory {
  static createUnit(unitName: string) {
    if (!monsters[unitName]) {
      return undefined;
    }

    const monsterConfig = monsters[unitName];

    const monsterDefaults = {} as MonsterInterface;

    // default values via Lazy Object Literal Initialization pattern to define default values
    monsterDefaults.cost = 1;
    monsterDefaults.attack = {
      value: 50,
      range: 1,
      speed: 1000
    };

    monsterDefaults.walkingSpeed = DEFAULT_WALKING_SPEED;
    monsterDefaults.mana = {
      max: 100,
      regen: 0
    };

    monsterDefaults.health = {
      max: 100,
      now: 100
    };

    monsterDefaults.attack = {
      value: 0,
      range: 0,
      speed: 0
    };

    return Object.assign({} as MonsterInterface, monsterDefaults, monsterConfig);
  }

  static getAllMonsters(): Array<string> {
    return Object.keys(monsters);
  }

  static getMonsterStats(monsterName: string) {
    return monsters[monsterName];
  }

  // getRandomCard() {
    // return randomProperty(this._monsters);
    // const monsterNames = Object.keys(this._monsters);
    // const filtered = {};
    // for (let i = 0; i < monsterNames.length; i++) {
    //   const monsterName = monsterNames[i];
    //   const mob: MonsterInterface = this._monsters[monsterName];
    //   if (mob.specialty?.shopRestricted) {
    //     continue;
    //   }
    //   filtered[monsterName] = mob;
    // }
    // return randomProperty(filtered) as MonsterInterface;
  // }
}
