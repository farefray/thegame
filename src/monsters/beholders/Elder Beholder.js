import Monster from '../../abstract/Monster';

function Elder_Beholder() {
  return new Monster({
    lookType: 108,
    cost: 4,
    hp: 1050,
    mana: 0,
    attack: 85,
    attackRange: 4,
    particle: 1,
    armor: 0,
    speed: 800,
    attackSpeed: 1000,
    manaRegen: 10
  });
}

export default Elder_Beholder;
