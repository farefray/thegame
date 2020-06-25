import { MonsterInterface } from '../typings/Monster';
import * as monsters from '../cards/index';
import { randomProperty } from '../utils/randomProperty';
console.log("monsters", monsters)

class CardsFactory {
  private static instance: CardsFactory;
  private _monsters: object;

  private constructor() {
    console.log('CardsFactory service is being constructed.');

    this._monsters = {};
    Object.keys(monsters).forEach((element) => {
      console.log("CardsFactory -> constructor -> element", element)
      const monsterName = element.toLowerCase();
      const mob = new monsters[element]();
      this._monsters[monsterName] = Object.assign({
        name: monsterName,
      }, mob) as MonsterInterface;
    });
  }

  public static getInstance(): CardsFactory {
    if (!CardsFactory.instance) {
      CardsFactory.instance = new CardsFactory();
    }

    return CardsFactory.instance;
  }

  getAllUnits() {
    return this._monsters;
  }

  getMonsterStats(name) {
    return this._monsters[name.toLowerCase()];
  }

  getRandomUnit() {
    const monsterNames = Object.keys(this._monsters);

    const filtered = {};
    for (let i = 0; i < monsterNames.length; i++) {
      const monsterName = monsterNames[i];
      const mob: MonsterInterface = this._monsters[monsterName];

      if (mob.specialty?.shopRestricted) {
        continue;
      }

      filtered[monsterName] = mob;
    }

    return randomProperty(filtered) as MonsterInterface;
  }
}

export default CardsFactory;
