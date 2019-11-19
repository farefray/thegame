import Monster from '../../abstract/Monster';

function Elder_Beholder() {
  return Monster({
    armor: 0,
    attack: 85,
    cost: 4,
    lookType: 108,
    attack: {
      range: 5,
      value: 60,
      particleID: 'fireball'
    },
    health: {
      max: 1050
    },
    speed: 800,
  });
}

export default Elder_Beholder;
