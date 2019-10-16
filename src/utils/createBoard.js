const pawns = require('../pawns');
const f = require('../f');

/**
 * Help function in creating battle boards
 * Use together with combine boards
 */
export default function createBoard(inputList) {
  const board = {};
  for (let i = 0; i < inputList.length; i++) {
    const el = inputList[i];
    const unit = pawns.getMonsterStats(el['name']); // this may be a overuse. Maybe units should be always Uni
    board[f.pos(el.x, el.y)] = unit;
  }
  return board;
}
