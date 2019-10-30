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