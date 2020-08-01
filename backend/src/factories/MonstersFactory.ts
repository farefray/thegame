import { MonsterInterface } from '../typings/Monster';
import * as monsters from '../configs/monsters';
import BattleUnit from '../structures/BattleUnit';

const DEFAULT_WALKING_SPEED = 1000;

export default class MonstersFactory {
  static getUnitConfiguration(unitName: string) {
    if (!monsters[unitName]) {
      return undefined;
    }

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

    monsterDefaults.spriteSize = 1;

    return Object.assign({} as MonsterInterface, monsterDefaults, monsters[unitName]);
  }

  static createBattleUnit(unitName: string) {
    const configuration = MonstersFactory.getUnitConfiguration(unitName);
    return new BattleUnit({
      ...configuration,
      name: unitName
    })
  }

  static getAllMonsters(): Array<string> {
    return Object.keys(monsters);
  }
}
