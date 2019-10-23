import Monster from '../abstract/Monster';

function Dwarf_Guard() {
  return new Monster({
    lookType: 70,
    cost: 3,
    hp: 800,
    mana: 0,
    attack: 75,
    attackRange: 1,
    armor: 15,
    speed: 700,
    attackSpeed: 1200,
    manaRegen: 2
  });
}

export default Dwarf_Guard;
