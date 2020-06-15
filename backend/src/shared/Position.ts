export default class Position {
  x: number;
  y: number;

  constructor(x: any, y = -1) {
    if (typeof x === 'object') {
      y = x.y;
      x = x.x;
    }

    this.x = x;
    this.y = y;
  }

  static fromString(str) {
    const splitted = str.toString().split(',');
    return new Position(Number(splitted[0]), Number(splitted[1]))
  }

  isValid() {
    return this.x >= 0 && this.x < 8 && this.y >= -1 && this.y < 8;
  }

  isHand () {
    return this.y === -1;
  }

  isMyPosition() {
    return this.y >= -1 && this.y < 4 && this.x >= 0 && this.x < 8;
  }

  toBoardPosition() {
    return `${this.x},${this.y}`;
  }
}

