import Monster from '../../abstract/Monster';

function BigBoy() {
  return Monster({
    armor: 5,
    attack: {
      value: 55,
      range: 1,
      speed: 1000,
    },
    cost: 3,
    lookType: 25,
    health: {
      max: 700,
    },
    mana: {
      max: 100,
      regen: 10,
    },
    walkingSpeed: 1000,
    // spell,
    specialty: {
      shopRestricted: true
    }
  });
}

export default BigBoy;
