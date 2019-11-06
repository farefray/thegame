import SpellConfig from './SpellConfig';

interface MonsterInterface {
  lookType: number,
  cost: number,
  health: number,
  mana: number,
  attack: number,
  attackRange: number,
  particle: number,
  armor: number,
  speed: number,
  attackSpeed: number,
  maxMana: number,
  manaRegen: number,
  healthRegen: number,
  spellConfig: SpellConfig
}

export default function Monster(monsterConfig: MonsterInterface): MonsterInterface {
  // exported instance
  const monster = {} as MonsterInterface;

  // default values via Lazy Object Literal Initialization pattern
  monster.cost = 1;
  monster.attackRange = 1;
  monster.speed = 1000;
  monster.attackSpeed = 1000;
  monster.maxMana = 100;
  monster.manaRegen = 5;
  monster.healthRegen = 2;
  return Object.assign({}, monster, monsterConfig);
};
