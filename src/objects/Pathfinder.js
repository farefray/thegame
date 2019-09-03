export default class Pathfinder {
  constructor({ gridWidth, gridHeight }) {
    this._occupiedTileSet = new Set();
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  get occupiedTileSet() {
    return this._occupiedTileSet;
  }

  findPath({ x, y, targetX, targetY }) {
    const normalize = number => {
      if (number < 0) {
        return -1;
      }
      if (number > 0) {
        return 1;
      }
      return 0;
    };

    const xDiff = normalize(targetX - x);
    const yDiff = normalize(targetY - y);

    if (yDiff) {
      if (!this.occupiedTileSet.has(`${x},${y + yDiff}`)) {
        return { x, y: y + yDiff };
      }
      if (xDiff && !this.occupiedTileSet.has(`${x + xDiff},${y}`)) {
        return { x: x + xDiff, y };
      }
      if (x < this.gridWidth - 1 && !this.occupiedTileSet.has(`${x + 1},${y}`)) {
        return { x: x + 1, y };
      }
      if (x > 0 && !this.occupiedTileSet.has(`${x - 1},${y}`)) {
        return { x: x - 1, y };
      }
      return { x, y };
    }
    if (xDiff) {
      if (!this.occupiedTileSet.has(`${x + xDiff},${y}`)) {
        return { x: x + xDiff, y };
      }
      if (yDiff && !this.occupiedTileSet.has(`${x},${y + yDiff}`)) {
        return { x, y: y + yDiff };
      }
      if (y < this.gridHeight - 1 && !this.occupiedTileSet.has(`${x},${y + 1}`)) {
        return { x, y: y + 1 };
      }
      if (y > 0 && !this.occupiedTileSet.has(`${x},${y - 1}`)) {
        return { x, y: y - 1 };
      }
      return { x, y };
    }

    return { x, y };
  }
}
