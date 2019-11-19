import Monster from '../../abstract/Monster';

function Minotaur_Mage() {
  return Monster({
    armor: 2,
    cost: 3,
    lookType: 23,
    mana: 0,
    manaRegen: 15,
    maxHealth: 650,
    speed: 1200,
  });
}

export default Minotaur_Mage;
