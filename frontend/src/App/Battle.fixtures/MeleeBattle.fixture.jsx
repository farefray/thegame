import React from 'react';
import ActiveGame from '../ActiveGame';

const generateBoard = () => {
  const unitCount = 7;
  const board = [];
  while (board.length < unitCount) {
    const x = Math.floor(Math.random() * 7);
    const y = Math.floor(Math.random() * 4);
    if (board.find(unit => unit.x === x && unit.y === y)) continue;
    board.push({
      name: 'minotaur',
      x,
      y
    });
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

const combinedBoard = {
  A: generateBoard(),
  B: flipBoard(generateBoard())
};

export default <ActiveGame props={combinedBoard} />;
