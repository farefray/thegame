import Monster from '../../abstract/Monster';

function Baby_Beholder() {
  return Monster({
    armor: 1,
    cost: 2,
    lookType: 109,
    maxHealth: 550,
    speed: 1200,
  });
}

export default Baby_Beholder;
