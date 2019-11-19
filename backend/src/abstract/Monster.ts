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
    particle?: string,
  }
  armor?: number,
  speed?: number,
  spell?: Function
}

export default function Monster(monsterConfig: MonsterInterface): MonsterInterface {
  // exported instance
  const monster = {} as MonsterInterface;

  // default values via Lazy Object Literal Initialization pattern to define default values
  monster.cost = 1;
  monster.attack = {
    value: 50,
    range: 1,
    speed: 1000
  };

  monster.speed = 1000;
  monster.mana = {
    max: 100,
    regen: 0
  }

  monster.health = {
    max: 100,
    now: 100
  };

  return Object.assign({}, monster, monsterConfig); // todo deep assign
};
