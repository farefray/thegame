import Monster from '../../abstract/Monster';
import BattleUnit from '../../objects/BattleUnit';

function Barrier() {
  return Monster({
    armor: 0,
    cost: 1,
    lookType: 1,
    health: {
      max: 100
    },
    speed: 0,
    specialty: {
      targetable: 0,
      walkable: 0
    }
  });
}

export default Barrier;
