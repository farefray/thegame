import BattleUnit from '../objects/BattleUnit';
import { Position } from '../objects/Position';

export default class BoardMatrix {
  private sizeX: number;
  private sizeY: number;
  private _matrix: Array<Array<BattleUnit | null>>;

  constructor(sizeX, sizeY) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this._matrix = [];
    return this;
  }

  get size() {
    return [this.sizeX, this.sizeY];
  }

  get matrix() {
    if (this._matrix.length) {
      return this._matrix;
    }

    // build base matrix
    const _matrix: Array<Array<BattleUnit | null>> = [];
    for (let y = 0; y < this.sizeY; y++) {
      const row: Array<BattleUnit | null> = [];
      for (let x = 0; x < this.sizeX; x++) {
        row[x] = null;
      }

      _matrix[y] = row;
    }

    this._matrix = _matrix;
    return this._matrix;
  }

  column(y) {
    if (y < 0 || y > this.sizeY - 1) {
      throw new RangeError('Illegal indexes');
    }

    const column: Array<BattleUnit | null> = [];
    for (const row of this) {
      column.push(row[y]);
    }

    return column;
  }

  row(x) {
    if (x < 0 || x > this.sizeX - 1) {
      throw new RangeError('Illegal indexes');
    }

    return [...this.matrix[x]];
  }

  getCell(x, y = 0): BattleUnit | null {
    if (x < 0 || x > this.sizeX - 1 || y < 0 || y > this.sizeY - 1) {
      throw new RangeError('Illegal indexes');
    }

    return this.matrix[y][x]; // because our matrix representation is reversed
  }

  /**
   * y param can be omitted if thats 1 dimension matrix assumed
   * value can be ommited if thats erasing
   */
  setCell(x, y = 0, value: BattleUnit | null = null): void {
    if (x < 0 || x > this.sizeX - 1 || y < 0 || y > this.sizeY - 1) {
      throw new RangeError('Illegal indexes');
    }

    this.matrix[y][x] = value;
  }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => ({
        value: this.matrix[index++],
        done: index > this.sizeX
      })
    };
  }

  forEach(fn) {
    for (let x = 0; x < this.sizeX; x++) {
      for (let y = 0; y < this.sizeY; y++) {
        fn(this.getCell(x, y), [x, y], this.matrix);
      }
    }
  }

  unitsAmount() {
    // todo optimize
    return this.units().length
  }

  units(): BattleUnit[] {
    // this can be replaced with .flat(2)
    const units: BattleUnit[] = [];
    this.forEach((spot) => {
      if (spot instanceof BattleUnit) {
        units.push(spot);
      }
    });

    return units;
  }

  freeSpots(): Position[] {
    const freeSpots: Position[] = [];
    this.forEach((spot, [x, y]) => {
      if (spot === null) {
        freeSpots.push({ x, y });
      }
    });

    return freeSpots;
  }

  /** For debug needs */
  toString() {
    const rows: Array<any> = [];
    for (let x = 0; x < this.sizeX; x++) {
      let row = '| ';
      for (let y = this.sizeY - 1; y > 0; y--) {
        row += this.getCell(x, y) + ' ';
      }
      row += ' |';
      rows.push(row);
    }

    return rows.join('\n');
  }
}
