import Monster from '../../abstract/Monster';

export default function Target_Melee() {
  return Monster({
    armor: 0,
    cost: 1,
    lookType: 3,
    health: {
      max: 1700
    },
    speed: 0
  });
};
