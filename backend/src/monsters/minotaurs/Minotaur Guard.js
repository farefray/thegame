import Monster from '../../abstract/Monster';

function Minotaur_Guard() {
  return new Monster({
    lookType: 29,
    cost: 3,
    hp: 875,
    mana: 0,
    attack: 60,
    attackRange: 1,
    armor: 10,
    speed: 1000,
    attackSpeed: 1000,
    manaRegen: 3
  });
}

export default Minotaur_Guard;
