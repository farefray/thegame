/**
 * Formats X/Y into string position
 * @export
 * @param {Integer} x
 * @param {Integer} y
 * @returns {String}
 */
exports.toBoardPosition = (x, y) => {
  if (y && y !== 0) { // hand position
    return `${x},${y}`;
  }

  return String(x);
};

// todo separate boardposition, cellposition, and this one cuz its very annoying and confusing [rename toboardposiitn to tostringposition or make position as object and asString()]

exports.isMyHandPosition = (position) => position.y && position.y === 0;
exports.isMyPosition = (position) => {
  return position.y 
    && position.y > 0 
    && position.y < 4
    && position.x >= 0 && position.x < 8;
}

exports.isPositionValid = (position) => {
  const isHand = position.y === 0;
  const result = position.x
    && position.y < 4
    && position.y >= 0
    && position.x >= 0
    && position.x < 8;

  return {
    result, isHand
  }
}
