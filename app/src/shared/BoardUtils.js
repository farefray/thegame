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