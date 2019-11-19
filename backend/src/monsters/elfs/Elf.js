import Monster from '../../abstract/Monster';

function Elf() {
  return Monster({
    armor: 2,
    attack: {
      value: 45,
      range: 7,
      speed: 1000,
      particle: 'arrow'
    },
    cost: 1,
    lookType: 62,
    health: {
      max: 150
    },
    speed: 1200,
  });
}

export default Elf;
