import Monster from '../abstract/Monster';

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
    spell: {
      requirements: {
        mana: 50,
        target: {
          type: 'single', // move to constants or to spells utils
          distance: 4
        }
      },
      config: {
        target: {
          damage: 5000
        },
        self: {
          damage: -5000
        }
      }
    }
  });
}

export default BigBoy;
