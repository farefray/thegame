import Monster from '../../abstract/Monster';

function Dwarf_Soldier() {
  return Monster({
    armor: 8,
    attack: 55,
    attackRange: 2,
    attackSpeed: 1200,
    cost: 2,
    lookType: 71,
    mana: 0,
    manaRegen: 6,
    maxHealth: 600,
    particle: 1,
    speed: 800,
  });
}

export default Dwarf_Soldier;
