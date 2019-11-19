import Monster from '../../abstract/Monster';

function Minotaur() {
  return Monster({
    armor: 5,
    cost: 1,
    healthRegen: 10,
    lookType: 25,
    maxHealth: 375,
    speed: 1000,
  });
}

export default Minotaur;
