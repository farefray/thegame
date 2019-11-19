import Monster from '../../abstract/Monster';

function Elf_Scout() {
  return Monster({
    armor: 0,
    attack: {
      value: 55,
      range: 5,
      speed: 1000,
      particle: 'arrow'
    },
    cost: 2,
    lookType: 64,
    health: {
      max: 350
    },
    speed: 1000,
  });
}

export default Elf_Scout;
