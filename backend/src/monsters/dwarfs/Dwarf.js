import Monster from '../../abstract/Monster';

function Dwarf() {
  return Monster({
    armor: 7,
    cost: 1,
    lookType: 69,
    attack: {
      value: 15,
      speed: 500
    },
    health: {
      max: 300
    },
    speed: 1000,
  });
}

export default Dwarf;
