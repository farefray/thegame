import _ from 'lodash';

interface MonsterInterface {
  lookType: number,
  cost: number,
  health: {
    now?: number,
    max: number,
    regen?: number // TODO if we need this
  },
  mana?: {
    max?: number,
    regen?: number
  },
  attack: {
    value: number,
    range: number,
    speed: number,
    particleID?: string,
  }
  armor?: number,
  speed?: number,
  spell?: Function
}

export default function Monster(monsterConfig: MonsterInterface): MonsterInterface {
  // exported instance
  const monsterDefaults = {} as MonsterInterface;

  // default values via Lazy Object Literal Initialization pattern to define default values
  monsterDefaults.cost = 1;
  monsterDefaults.attack = {
    value: 50,
    range: 1,
    speed: 1000
  };

  monsterDefaults.speed = 1000;
  monsterDefaults.mana = {
    max: 100,
    regen: 0
  }

  monsterDefaults.health = {
    max: 100,
    now: 100
  };

  return _.merge({}, monsterDefaults, monsterConfig);
};
