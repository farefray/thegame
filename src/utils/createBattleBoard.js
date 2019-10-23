import BattleUnit from '../objects/BattleUnit';
import Position from '../../../frontend/src/shared/Position';
import Monsters from './Monsters';

/**
 * Combines two boards into one for battle
 * Adds all relevant stats for the unit to the unit
 * Reverses position for enemy units
 * @param {Array{x:{Integer},y:{Integer},name:{String}}} board1
 * @param {Array{x:{Integer},y:{Integer},name:{String}}} board2
 */
export default function createBattleBoard(board1, board2) {
  const board = {};
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
