import Monster from '../../abstract/Monster';

function Dwarf() {
  return new Monster({
    armor: 7,
    attack: 60,
    attackRange: 1,
    attackSpeed: 1500,
    cost: 1,
    lookType: 69,
    mana: 0,
    manaRegen: 10,
    maxHealth: 300,
    speed: 1000,
  });
}

export default Dwarf;
