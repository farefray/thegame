import Monster from '../../abstract/Monster';

function Baby_Beholder() {
  return new Monster({
    armor: 1,
    attack: 45,
    attackRange: 2,
    attackSpeed: 1000,
    cost: 2,
    lookType: 109,
    mana: 0,
    manaRegen: 10,
    maxHealth: 550,
    particle: 1,
    speed: 1200,
  });
}

export default Baby_Beholder;
