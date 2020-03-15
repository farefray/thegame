import BattleUnit from '../objects/BattleUnit';

export const getDistanceBetweenCoordinates = ({ x, y, x2, y2 }) => (Math.max(Math.abs(x2 - x), Math.abs(y2 - y)) - 1);

export const getClosestTargets = ({ x, y, targets, maxDistance = 9, amount = 1 }): BattleUnit | Array<BattleUnit> | null => {
  let targetsDistances:any = [];
  for (const target of targets) {
    const { x: targetX, y: targetY } = target;

    const distance = getDistanceBetweenCoordinates({
      x,
      y,
      x2: targetX,
      y2: targetY
    });

    if (distance < maxDistance) {
      targetsDistances.push({
        distance,
        target
      })
    }
  }

  targetsDistances = targetsDistances.sort((a, b) => ((a.distance > b.distance) ? 1 : -1) );

  const returnArray:Array<BattleUnit> = [];
  for (let index = 0; index < amount && index < targetsDistances.length; index++) {
    returnArray.push(targetsDistances[index].target);
  }

  return returnArray;
};

/**
 * @param amount
 */
interface TargetSearchParams {
  enemy: boolean;
  amount: number;
  maxDistance?: number;
}

// most likely this function is not needed, as it mostly passes all the stuff down to getClosestTargets
export function getSuitableTargets(caster: BattleUnit, units: Array<BattleUnit>, params: TargetSearchParams): Array<BattleUnit> | BattleUnit | null {
  const targets = units.filter(u => 
    u.teamId === (params.enemy ? caster.oppositeTeamId : caster.teamId)
    && u.isAlive
    && u.id !== caster.id);

  const suitableTargets = getClosestTargets({
    x: caster.x,
    y: caster.y,
    targets,
    maxDistance: params.maxDistance || 9,
    amount: params.amount || 1
  });

  return suitableTargets;
};
