import Monster from '../../abstract/Monster';

function Beholder() {
  return Monster({
    "armor": 2,
    "cost": 3,
    "lookType": 17,
    health: {
      max: 750
    },
    "speed": 800,
  });
}

export default Beholder;
