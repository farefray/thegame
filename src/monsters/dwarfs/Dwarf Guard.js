import Monster from '../../abstract/Monster';

function Dwarf_Guard() {
  return Monster({
    armor: 15,
    cost: 3,
    lookType: 70,
    mana: 0,
    manaRegen: 2,
    maxHealth: 800,
    speed: 700,
  });
}

export default Dwarf_Guard;
