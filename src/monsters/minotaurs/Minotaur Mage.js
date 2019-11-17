import Monster from '../../abstract/Monster';

function Minotaur_Mage() {
  return Monster({
    armor: 2,
    attack: 45,
    attackRange: 3,
    attackSpeed: 1000,
    cost: 3,
    lookType: 23,
    mana: 0,
    manaRegen: 15,
    maxHealth: 650,
    particle: 1,
    speed: 1200,
  });
}

export default Minotaur_Mage;
