import Monster from '../../abstract/Monster';

function Elf() {
  return Monster({
    armor: 2,
    attack: {
      value: 45,
      range: 3,
      speed: 1000,
      effect: {
        id: 'arrow',
        duration: 100
      }
    },
    cost: 1,
    lookType: 62,
    maxHealth: 150,
    speed: 1200,
  });
}

export default Elf;
