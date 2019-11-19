import Monster from '../../abstract/Monster';

function Minotaur() {
  return Monster({
    armor: 5,
    cost: 1,
    lookType: 25,
    health: {
      max: 375
    },
    speed: 1000,
  });
}

export default Minotaur;
