import Monster from '../../abstract/Monster';

function Dwarf_Guard() {
  return Monster({
    armor: 15,
    cost: 3,
    lookType: 70,
    maxHealth: 800,
    speed: 700,
  });
}

export default Dwarf_Guard;
