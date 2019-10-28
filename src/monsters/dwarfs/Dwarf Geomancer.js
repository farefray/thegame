import Monster from '../../abstract/Monster';
import Spell from '../../abstract/Spell';

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
    spell: new Spell({
      requirements: {
        mana: 100,
        target: 'ally',
        distance: 4
      },
      config: {
        target: {
          damage: -100
        }
      }
    })
  });
}

export default Dwarf_Geomancer;
