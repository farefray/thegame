import Monster from '../../abstract/Monster';

function Dwarf() {
  return Monster({
    armor: 10,
    cost: 1,
    lookType: 69,
    attack: {
      value: 35,
      speed: 1500
    },
    health: {
      max: 300
    },
    speed: 1000,
  });
}

export default Dwarf;
