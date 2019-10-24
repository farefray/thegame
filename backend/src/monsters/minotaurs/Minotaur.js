import Monster from '../../abstract/Monster';

function Minotaur() {
  return new Monster({
    lookType: 25,
    cost: 1,
    hp: 375,
    mana: 0,
    attack: 50,
    attackRange: 1,
    armor: 5,
    speed: 1000,
    attackSpeed: 1000,
    manaRegen: 10
  });
}

export default Minotaur;
