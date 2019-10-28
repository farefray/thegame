import Monster from '../abstract/Monster';
import Spell from '../abstract/Spell';

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
    spell: new Spell({
      requirements: {
        mana: 50,
        target: {
          type: 'single', // move to constants or to spells utils
          distance: 4
        }
      },
      config: {
        target: {
          damage: 250
        },
        self: {
          damage: 500
        }
      }
    })
  });
}

export default BigBoy;
