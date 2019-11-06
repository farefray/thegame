import BattleUnit from '../objects/BattleUnit';
import Position from '../../../frontend/src/shared/Position';
import Monsters from './Monsters';

interface SimpleUnit {
  x: number,
  y: number,
  name: string
}

interface Units {
  [key: string]: SimpleUnit
}

interface Board {
  owner: string;
  units: Units;
}


/**
 * Combines two boards into one for battle
 * Adds all relevant stats for the unit to the unit
 * Reverses position for enemy units
 */
export default function createBattleBoard(firstBoard: Board, secondBoard: Board): object {
  const board = {};

  // hidden properties to identify board owners
  board[Symbol.for('_firstOwner')] = firstBoard.owner;
  board[Symbol.for('_secondOwner')] = secondBoard.owner;

  for (const index in firstBoard.units) {
    const simpleUnit = firstBoard.units[index]; // @TODO handle case when board already contains BattleUnits
    const unit = Monsters.getMonsterStats(simpleUnit.name);
    const unitPos = new Position(simpleUnit.x, simpleUnit.y);
    board[unitPos.toString()] = new BattleUnit(unit, unitPos, 0);
  }

  for (const index in secondBoard.units) {
    const simpleUnit = secondBoard.units[index];
    const unit = Monsters.getMonsterStats(simpleUnit.name);
    const unitPos = new Position(simpleUnit.x, simpleUnit.y);
    board[unitPos.toString()] = new BattleUnit(unit, unitPos, 1);
  }

  return board;
}
