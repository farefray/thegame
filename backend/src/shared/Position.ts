export default class Position {
  x: number;
  y: number;

  constructor(firstParam: any, secondParam?: any) {
    if (typeof firstParam === 'object' && typeof firstParam.x === 'number') {
      this.x = firstParam.x;
      this.y = firstParam.y;
    } else if (typeof firstParam === 'string' && !Number(firstParam)) {
      const splitted = firstParam.split(',');
      this.x = parseInt(splitted[0], 2);
      this.y = parseInt(splitted[1], 2);
    } else {
      this.x = firstParam;
      this.y = secondParam;
    }

    this.x = Number(this.x);
    this.y = Number(this.y);
  }

  isValid() {
    return this.x >= 0 && this.x < 8 && this.y >= -1 && this.y < 8;
  }

  isMyHandPosition () {
    return this.y === -1;
  }


  toBoardPosition() {
    return `${this.x},${this.y}`;
  }
}

