import Monster from '../../abstract/Monster';

function Dwarf_Geomancer() {
  return new Monster({
    armor: 1,
    attack: 40,
    attackRange: 3,
    attackSpeed: 900,
    cost: 3,
    lookType: 66,
    mana: 0,
    manaRegen: 20,
    maxHealth: 550,
    particle: 1,
    speed: 1400,
    spellconfig: {
      name: 'regeneration',
      mana: 100,
      value: 30,
      ticks: 10
    }
  })
}

export default Dwarf_Geomancer;

