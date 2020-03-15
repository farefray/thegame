import Monster from '../../abstract/Monster';

function Minotaur_Archer() {
  return Monster({
    armor: 4,
    attack: {
      value: 65,
      range: 3,
      speed: 1000,
      particleID: 'arrow'
    },
    cost: 2,
    lookType: 24,
    health: {
      max: 550
    },
    speed: 1200,
  });
}

export default Minotaur_Archer;
