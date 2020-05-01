import Monster from '../../abstract/Monster';

export default function Target_Melee() {
  return Monster({
    armor: 0,
    cost: 1,
    lookType: 3,
    health: {
      max: 700,
    },
    walkingSpeed: 0,
    specialty: {
      passive: true,
    },
  });
}
