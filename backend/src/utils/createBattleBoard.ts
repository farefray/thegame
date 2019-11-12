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
 * @TODO can be omitted P0!
 */
export default function createBattleBoard(firstBoard: Board, secondBoard: Board): object {
  const board = {};

  // hidden properties to identify board owners
  board[Symbol.for('_firstOwner')] = firstBoard.owner;
  board[Symbol.for('_secondOwner')] = secondBoard.owner;

  for (const index in firstBoard.units) {
    const simpleUnit = firstBoard.units[index];
    const unitPos = new Position(simpleUnit.x, simpleUnit.y);
    board[unitPos.toString()] = new BattleUnit(Monsters.getMonsterStats(simpleUnit.name), unitPos, 0);
  }

  for (const index in secondBoard.units) {
    const simpleUnit = secondBoard.units[index];
    const unitPos = new Position(simpleUnit.x, simpleUnit.y);
    board[unitPos.toString()] = new BattleUnit(Monsters.getMonsterStats(simpleUnit.name), unitPos, 1);
  }

  return board;
}
