export default class Step {
  public x: number;
  public y: number;
  public resistance: number;

  constructor({
        x = 0,
        y = 0,
        resistance = 0,
    } = {}) {
      this.x = x;
      this.y = y;
      this.resistance = resistance;
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
