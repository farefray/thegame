/**
 * @constructor
 * @description Position object with helpfull methods
 * @param {Integer|Object} x
 * @param {Integer} y
 */
function Position(x, y) {
  if (typeof x === 'object' && typeof x.x === 'number') {
    this.x = x.x;
    this.y = x.y;
  } else {
    this.x = x;
    this.y = y;
  }
}

Position.prototype.name = 'Position';

Position.prototype.toString = function() {
  return `${this.x},${this.y}`;
};

Position.prototype.toBoardPosition = function() {
  if (!isNaN(this.y)) {
    return `${this.x},${this.y}`;
  }

  return String(this.x);
};

Position.prototype.isMyHandPosition = function() {
  return this.y === undefined;
};

Position.prototype.isBoard = function() {
  return !isNaN(this.y);
};

/**
 * @description Determines is current position belongs to my hand or my bord part
 */
Position.prototype.isMyPosition = function() {
  return this.y >= 0 && this.y < 4 && this.x >= 0 && this.x < 8;
};

module.exports = Position;
