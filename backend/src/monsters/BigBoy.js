import Monster from '../abstract/Monster';
import SpellConfig from '../../abstract/SpellConfig';

function BigBoy() {
  return new Monster({
    lookType: 25,
    cost: 1,
    hp: 3750,
    mana: 0,
    attack: 50,
    attackRange: 1,
    armor: 5,
    speed: 1000,
    attackSpeed: 1000,
    manaRegen: 10,
    // spellconfig: new SpellConfig({
    //   name: 'singletargetdamage',
    //   mana: 50,
    //   value: 150
    // })
  });
}

export default BigBoy;
