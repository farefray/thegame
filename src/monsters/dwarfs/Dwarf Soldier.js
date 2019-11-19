import Monster from '../../abstract/Monster';

function Dwarf_Soldier() {
  return Monster({
    armor: 8,
    cost: 2,
    lookType: 71,
    health: {
      max: 600
    },
    speed: 800,
  });
}

export default Dwarf_Soldier;
