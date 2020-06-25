import { MonsterInterface } from "../../../typings/Monster";


const DEFAULT_WALKING_SPEED = 1000;
export default function Monster(monsterConfig: MonsterInterface): MonsterInterface {
  // exported instance
  const monsterDefaults = {} as MonsterInterface;

  // default values via Lazy Object Literal Initialization pattern to define default values
  monsterDefaults.cost = 1;
  monsterDefaults.attack = {
    value: 50,
    range: 1,
    speed: 1000,
  };

  monsterDefaults.walkingSpeed = DEFAULT_WALKING_SPEED;
  monsterDefaults.mana = {
    max: 100,
    regen: 0,
  };

  monsterDefaults.health = {
    max: 100,
    now: 100,
  };

  monsterDefaults.attack = {
    value: 0,
    range: 0,
    speed: 0,
  };

  return Object.assign({} as MonsterInterface, monsterDefaults, monsterConfig);
}
