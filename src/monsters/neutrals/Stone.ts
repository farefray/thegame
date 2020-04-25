import Monster from '../../abstract/Monster';

export default function Stone() {
  return Monster({
    armor: 0,
    cost: 1,
    lookType: 1,
    health: {
      max: 100
    },
    walkingSpeed: 0,
    specialty: {
      targetable: false,
      passive: true
    }
  });
};
