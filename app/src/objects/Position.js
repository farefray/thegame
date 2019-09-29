/**
 * @constructor
 * @description Position object with helpfull methods
 * @param {Integer|Object|String} firstParam
 * @param {Integer} y
 */
function Position(firstParam, secondParam = -1) {
  try {
    if (typeof firstParam === 'object' && typeof firstParam.x === 'number') {
      this.x = firstParam.x;
      this.y = firstParam.y;
    } else if (typeof firstParam === 'string' && !Number(firstParam)) {
      const splitted = firstParam.split(',');
      this.x = splitted[0];
      this.y = splitted[1];
    } else {
      this.x = firstParam;
      this.y = secondParam;
    }
  } catch (e) {
    throw new Error('Position constructor is invalid!');
  }
}

Position.prototype.name = 'Position';

Position.prototype.toString = function () {
  return `${this.x},${this.y}`;
};

Position.prototype.toBoardPosition = function () {
  return `${this.x},${this.y}`;
};

Position.prototype.isMyHandPosition = function () {
  return this.y === -1;
};

Position.prototype.isBoard = function () {
  return (this.y !== -1);
};

/**
 * @description Determines is current position belongs to my hand or my bord part
 */
Position.prototype.isMyPosition = function () {
  return this.y >= -1 && this.y < 4 && this.x >= 0 && this.x < 8;
};


const tileSize = 64;
const boardSize = tileSize * 8;
Position.prototype.vectorX = function () {
  return this.x * tileSize;
};

Position.prototype.vectorY = function () {
  return boardSize - this.y * tileSize;
};

module.exports = Position;