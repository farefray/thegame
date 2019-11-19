import Monster from '../../abstract/Monster';

function Minotaur_Archer() {
  return Monster({
    armor: 4,
    cost: 2,
    lookType: 24,
    health: {
      max: 550
    },
    speed: 1200,
  });
}

export default Minotaur_Archer;
