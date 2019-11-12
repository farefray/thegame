import BattleUnit from '../objects/BattleUnit';

export const getDistanceBetweenCoordinates = ({ x, y, targetX, targetY }) => Math.max(0, Math.abs(targetX - x) - 1) + Math.max(0, Math.abs(targetY - y) - 1);

export const getClosestTarget = ({ x, y, targets, maxDistance = 9 }): BattleUnit | null => {
  let closestTarget = null;
  let closestTargetDistance = Infinity;
  for (const target of targets) {
    const { x: targetX, y: targetY } = target;

    const distance = getDistanceBetweenCoordinates({
      x,
      y,
      targetX,
      targetY
    });
    if (distance < closestTargetDistance && distance < maxDistance) {
      closestTarget = target;
      closestTargetDistance = distance;
    }
    if (!distance) break;
  }

  return closestTarget;
};

/**
 * @param {BattleUnit} caster
 * @param {Array} units
 * @param {Object} params
 * @param {Boolean} params.enemy
 */
export const getSuitableTarget = (caster, units, params) => {
  const targets = units.filter(u => u.team === (params.enemy ? caster.oppositeTeam() : caster.team) && u.isAlive());

  return getClosestTarget({ x: caster.x, y: caster.y, targets });
};
