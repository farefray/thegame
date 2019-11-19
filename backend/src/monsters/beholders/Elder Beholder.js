import Monster from '../../abstract/Monster';

function Elder_Beholder() {
  return Monster({
    armor: 0,
    attack: 85,
    cost: 4,
    lookType: 108,
    maxHealth: 1050,
    speed: 800,
  });
}

export default Elder_Beholder;
