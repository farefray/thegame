import Monster from '../../abstract/Monster';

function Minotaur_Mage() {
  return new Monster({
    lookType: 23,
    cost: 3,
    hp: 650,
    mana: 0,
    attack: 80,
    attackRange: 3,
    particle: 1,
    armor: 2,
    speed: 1200,
    attackSpeed: 1000,
    manaRegen: 15
  });
}

export default Minotaur_Mage;
