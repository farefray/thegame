import Monster from '../../abstract/Monster';

function Minotaur() {
  return new Monster({
    armor: 5,
    attack: 50,
    attackRange: 1,
    attackSpeed: 1000,
    cost: 1,
    healthRegen: 10,
    lookType: 25,
    mana: 0,
    manaRegen: 10,
    maxHealth: 375,
    speed: 1000,
  });
}

export default Minotaur;
