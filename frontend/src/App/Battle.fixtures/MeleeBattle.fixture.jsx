import React from 'react';
import ActiveGame from '../ActiveGame';
import BattleUnitList from '@/../../backend/src/structures/Battle/BattleUnitList';
import BattleUnit from '@/../../backend/src/structures/BattleUnit';

const generateBoard = () => {
  const unitCount = 7;
  const board = new BattleUnitList();
  while (board.size < unitCount) {
    const x = Math.floor(Math.random() * 7);
    const y = Math.floor(Math.random() * 4);
    if (board.find(unit => unit.x === x && unit.y === y)) continue;
    board.push(new BattleUnit({
      name: 'minotaur',
      x,
      y
    }));
  }
  return board;
};

const flipBoard = board => {
  for (const unit of board) {
    unit.y = 7 - unit.y;
    unit.x = 7 - unit.x;
    unit.name = 'dwarf';
  }
  return board;
};

const defaultBoard = [{
  owner: 'first_player',
  units: generateBoard()
},
{
  owner: 'second_player',
  units: flipBoard(generateBoard())
}];

console.log("defaultBoard", defaultBoard)
export default <ActiveGame props={defaultBoard} />;

