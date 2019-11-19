interface Effect {
  id: string,
  duration: number
}

interface MonsterInterface {
  lookType: number,
  cost: number,
  maxHealth: number,
  mana?: number,
  attack: {
    value: number,
    range: number,
    speed: number,
    effect?: Effect,
  }
  armor?: number,
  speed?: number,
  maxMana?: number,
  manaRegen?: number,
  healthRegen?: number,
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
  monster.maxMana = 100;
  monster.manaRegen = 5;
  monster.healthRegen = 2;
  return Object.assign({}, monster, monsterConfig);
};
