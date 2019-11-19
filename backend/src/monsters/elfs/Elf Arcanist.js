import Monster from '../../abstract/Monster';

function Elf_Arcanist() {
  return Monster({
    armor: 1,
    cost: 3,
    lookType: 63,
    health: {
      max: 550
    },
    speed: 1400,
  });
}

export default Elf_Arcanist;
