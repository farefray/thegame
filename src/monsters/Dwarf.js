import Monster from '../abstract/Monster';

function Dwarf() {
  return new Monster({
    lookType: 69,
    cost: 1,
    hp: 300,
    mana: 0,
    attack: 60,
    attackRange: 1,
    armor: 7,
    speed: 1000,
    attackSpeed: 1500,
    manaRegen: 10
  });
}

export default Dwarf;
