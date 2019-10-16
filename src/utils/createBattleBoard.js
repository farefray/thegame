
/**
 * Combines two boards into one for battle
 * Adds all relevant stats for the unit to the unit
 * Reverses position for enemy units
 */

import BattleUnit from '../objects/BattleUnit';
import Position from '../../app/src/objects/Position';

export default function createBattleBoard(board1, board2) {
  const newBoard = {};

  for (const unitPos in board1) {
    const unit = board1[unitPos];
    const battleUnit = new BattleUnit(unit, new Position(unitPos), 0);
    newBoard[unitPos] = battleUnit;
  }

  for (const unitPos in board2) {
    const unit = board2[unitPos];
    const battleUnit = new BattleUnit(unit, new Position(unitPos), 1);
    newBoard[unitPos] = battleUnit;
  }

  return newBoard;
}
