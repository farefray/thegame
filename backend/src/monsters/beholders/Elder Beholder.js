import Monster from '../../abstract/Monster';

function Elder_Beholder() {
  return new Monster({
    armor: 0,
    attack: 85,
    attackRange: 4,
    attackSpeed: 1000,
    cost: 4,
    lookType: 108,
    mana: 0,
    manaRegen: 10,
    maxHealth: 1050,
    particle: 1,
    speed: 800,
  });
}

export default Elder_Beholder;