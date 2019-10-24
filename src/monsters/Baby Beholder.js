import Monster from '../abstract/Monster';

function Baby_Beholder() {
  return new Monster({
    lookType: 109,
    cost: 2,
    hp: 550,
    mana: 0,
    attack: 45,
    attackRange: 2,
    particle: 1,
    armor: 1,
    speed: 1200,
    attackSpeed: 1000,
    manaRegen: 10
  });
}

export default Baby_Beholder;
