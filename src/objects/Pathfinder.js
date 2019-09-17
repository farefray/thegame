class Step {
  constructor({ x, y, resistance } = {}) {
    this.x = x || 0;
    this.y = y || 0;
    this.resistance = resistance || 0;
  }

  applyModifiers(modifiers) {
    for (const modifier of modifiers) {
      const isMatchingX = modifier.x === undefined || modifier.x === this.x;
      const isMatchingY = modifier.y === undefined || modifier.y === this.y;
      if (!isMatchingX || !isMatchingY) continue;
      this.resistance += modifier.resistance;
    }
  }

  isSameDirection(step) {
    return this.x === step.x && this.y === step.y;
  }
}

const normalize = number => {
  if (number < 0) {
    return -1;
  }
  if (number > 0) {
    return 1;
  }
  return 0;
};

export default class Pathfinder {
  constructor({ gridWidth, gridHeight }) {
    this._occupiedTileSet = new Set();
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  get occupiedTileSet() {
    return this._occupiedTileSet;
  }

  findStepToTarget(unit, targetUnit) {
    const possibleSteps = this.getUnitPossibleSteps(unit);
    if (!possibleSteps.length) return new Step();

    const distance = {
      x: Math.abs(targetUnit.x - unit.x),
      y: Math.abs(targetUnit.y - unit.y)
    };
    const normalizedDistance = {
      x: normalize(targetUnit.x - unit.x),
      y: normalize(targetUnit.y - unit.y)
    };
    const preferredAxis = distance.x > distance.y ? 'x' : 'y';
    const secondaryAxis = preferredAxis === 'x' ? 'y' : 'x';

    const modifiers = [
      { [preferredAxis]: normalizedDistance[preferredAxis], resistance: -20 },
      { [preferredAxis]: normalizedDistance[preferredAxis] * -1, resistance: 20 },
      { [secondaryAxis]: normalizedDistance[secondaryAxis], resistance: -10 },
      { [secondaryAxis]: normalizedDistance[secondaryAxis] * -1, resistance: 10 }
    ];
    const { previousStep } = unit;
    if (previousStep) {
      modifiers.push({
        x: previousStep.x,
        y: previousStep.y,
        resistance: -5
      });
    }
    possibleSteps.forEach(step => step.applyModifiers(modifiers));
    const lowestResistance = Math.min(...possibleSteps.map(step => step.resistance));
    const optimalSteps = possibleSteps.filter(step => step.resistance === lowestResistance);
    if (optimalSteps.length === 1) {
      return new Step({ x: optimalSteps[0].x, y: optimalSteps[0].y });
    }
    const optimalStep = possibleSteps.reduce((previous, current) => (previous.resistance > current.resistance ? current : previous));

    return { x: optimalStep.x, y: optimalStep.y };
  }

  getUnitPossibleSteps(unit) {
    return [new Step({ x: 0, y: -1 }), new Step({ x: 0, y: 1 }), new Step({ x: -1, y: 0 }), new Step({ x: 1, y: 0 })].filter(step => {
      const isOutOfBounds = unit.x + step.x < 0 || unit.x + step.x >= this.gridWidth || unit.y + step.y < 0 || unit.y + step.y >= this.gridHeight;
      if (isOutOfBounds) return false;
      const isOccupied = this.occupiedTileSet.has(`${unit.x + step.x},${unit.y + step.y}`);
      if (isOccupied) return false;
      return true;
    });
  }

  static getClosestTarget({ x, y, targets }) {
    let closestTarget = null;
    let closestTargetDistance = Infinity;
    for (const target of targets) {
      const { x: targetX, y: targetY } = target;
      const distance = this.getDistanceBetweenCoordinates({ x, y, targetX, targetY });
      if (distance < closestTargetDistance) {
        closestTarget = target;
        closestTargetDistance = distance;
      }
      if (!distance) break;
    }
    return closestTarget;
  }

  static getDistanceBetweenCoordinates({ x, y, targetX, targetY }) {
    return Math.max(0, Math.abs(targetX - x) - 1) + Math.max(0, Math.abs(targetY - y) - 1);
  }

  /**
   * @param {BattleUnit} unit1
   * @param {BattleUnit} unit2
   * @returns {Integer}
   */
  static getDistanceBetweenUnits(unit1, unit2) {
    return this.getDistanceBetweenCoordinates({
      x: unit1.x,
      y: unit1.y,
      targetX: unit2.x,
      targetY: unit2.y
    });
  }
}
