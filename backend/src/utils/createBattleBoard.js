import BattleUnit from '../objects/BattleUnit';
import Position from '../../../frontend/src/shared/Position';
import Monsters from './Monsters';

/**
 * Combines two boards into one for battle
 * Adds all relevant stats for the unit to the unit
 * Reverses position for enemy units
 * @param {Array{x:{Integer},y:{Integer},name:{String}}} board1
 * @param {Array{x:{Integer},y:{Integer},name:{String}}} board2
 * @param {String} boardID1 player identify for first board
 * @param {String} boardID2 player identify for second board
 */
export default function createBattleBoard(board1, board2, boardID1, boardID2) {
  const board = {};

  if (boardID1) {
    // hidden property to identify board owner
    board[Symbol('_board1Index')] = boardID1;
  }

  if (boardID2) {
    // hidden property to identify board owner
    board[Symbol('_board2Index')] = boardID2;
  }

  for (const index in board1) {
    const el = board1[index]; // @TODO handle case when board already contains BattleUnits
    const unit = Monsters.getMonsterStats(el.name);
    const unitPos = new Position(el.x, el.y);
    board[unitPos.toString()] = new BattleUnit(unit, unitPos, 0);
  }

  for (const index in board2) {
    const el = board2[index];
    const unit = Monsters.getMonsterStats(el.name);
    const unitPos = new Position(el.x, el.y);
    board[unitPos.toString()] = new BattleUnit(unit, unitPos, 1);
  }

  return board;
}
