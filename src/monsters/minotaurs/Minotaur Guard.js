import Monster from '../../abstract/Monster';

function Minotaur_Guard() {
  return Monster({
    armor: 10,
    cost: 3,
    lookType: 29,
    health: {
      max: 875
    },
    speed: 1000,
  });
}

export default Minotaur_Guard;
