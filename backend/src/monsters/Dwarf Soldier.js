import Monster from '../abstract/Monster';

function Dwarf_Soldier() {
  return new Monster({
    lookType: 71,
    cost: 2,
    hp: 600,
    mana: 0,
    attack: 55,
    attackRange: 2,
    particle: 1,
    armor: 8,
    speed: 800,
    attackSpeed: 1200,
    manaRegen: 6
  });
}

export default Dwarf_Soldier;
