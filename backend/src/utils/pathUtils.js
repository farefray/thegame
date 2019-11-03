exports.getClosestTarget = function ({
  x,
  y,
  targets
}, maxDistance = 9) {
  let closestTarget = null;
  let closestTargetDistance = Infinity;
  for (const target of targets) {
    const {
      x: targetX,
      y: targetY
    } = target;

    const distance = this.getDistanceBetweenCoordinates({
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

exports.getDistanceBetweenCoordinates = function ({ x, y, targetX, targetY }) {
  return Math.max(0, Math.abs(targetX - x) - 1) + Math.max(0, Math.abs(targetY - y) - 1);
};

/**
 * @param {BattleUnit} caster
 * @param {Array} units
 * @param {Object} params
 * @param {Boolean} params.enemy
 */
exports.getSuitableTarget = function (caster, units, params) {
  const targets = units.filter(u => {
    return u.team === (params.enemy ? caster.oppositeTeam() : caster.team) && u.isAlive();
  })

  return pathUtils.getClosestTarget({ x: caster.x, y: caster.y, targets: targets })
}
