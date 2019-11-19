import Monster from '../../abstract/Monster';

function Minotaur_Guard() {
  return Monster({
    armor: 10,
    cost: 3,
    healthRegen: 10,
    lookType: 29,
    maxHealth: 875,
    speed: 1000,
  });
}

export default Minotaur_Guard;
