import React from 'react';
import ActiveGame from '../ActiveGame';
import Monsters from '@/../../backend/src/utils/Monsters';

const generateBoard = () => {
  const unitCount = 8;
  const board = [];
  while (board.length < unitCount) {
    const x = Math.floor(Math.random() * 8);
    const y = 0;
    if (board.find(unit => unit.x === x && unit.y === y)) continue;
    board.push({
      name: Monsters.getRandomUnit().name,
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
    unit.name = Monsters.getRandomUnit().name;
  }
  return board;
};

const combinedBoard = {
  A: generateBoard(),
  B: flipBoard(generateBoard())
};

export default <ActiveGame props={combinedBoard} />;
