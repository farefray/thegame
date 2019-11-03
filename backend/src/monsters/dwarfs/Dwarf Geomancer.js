import Monster from '../../abstract/Monster';
import SpellConfig from '../../abstract/SpellConfig';

function Dwarf_Geomancer() {
  return new Monster({
    lookType: 66,
    cost: 3,
    hp: 550,
    mana: 0,
    attack: 40,
    attackRange: 3,
    particle: 1,
    armor: 1,
    speed: 1400,
    attackSpeed: 900,
    manaRegen: 20,
    spellconfig: new SpellConfig({
      name: 'regeneration',
      mana: 100,
      value: 30,
      ticks: 10
    })
  });
}

export default Dwarf_Geomancer;
