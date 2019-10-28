import Monster from '../abstract/Monster';
import Pathfinder from '../objects/Pathfinder';

function BigBoy() {
  return new Monster({
    lookType: 25,
    cost: 1,
    hp: 3750,
    mana: 0,
    attack: 50,
    attackRange: 1,
    armor: 5,
    speed: 1000,
    attackSpeed: 1000,
    manaRegen: 10,
    spell: {
      evaluate: unit => {
        const manaCost = 50;
        const target = Pathfinder.getClosestTarget({ x: unit.x, y: unit.y, targets: unit.units.filter(u => u.team === unit.oppositeTeam() && u.isAlive()) });
        return { canCast: unit.mana >= manaCost && target, target };
      },
      execute: (unit, props) => {
        const target = props.target;
        unit.mana -= 50;
        unit.healthChange(5000);
        target.healthChange(-5000);
      }
    }
  });
}

export default BigBoy;
