import Monster from '../abstract/Monster';

function Dwarf_Geomancer() {
  return new Monster({
    lookType: 66,
    cost: 3,
    hp: 550,
    mana: 0,
    attack: 75,
    attackRange: 3,
    particle: 1,
    armor: 1,
    speed: 1400,
    attackSpeed: 900,
    manaRegen: 20
  });
}

export default Dwarf_Geomancer;
