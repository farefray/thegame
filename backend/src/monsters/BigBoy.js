import Monster from '../abstract/Monster';
import SpellConfig from '../abstract/SpellConfig';

function BigBoy() {
  return new Monster({
    armor: 5,
    attack: 50,
    attackRange: 1,
    attackSpeed: 1000,
    cost: 1,
    lookType: 25,
    mana: 0,
    manaRegen: 10,
    maxHealth: 3750,
    speed: 1000,
    // spellconfig: new SpellConfig({
    //   name: 'singletargetdamage',
    //   mana: 50,
    //   value: 150
    // })
  });
}

export default BigBoy;
