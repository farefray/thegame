import Monster from '../../abstract/Monster';

function Target() {
  return Monster({
    armor: 0,
    cost: 1,
    lookType: 2,
    health: {
      max: 1700
    },
    speed: 0
  });
}

export default Target;
