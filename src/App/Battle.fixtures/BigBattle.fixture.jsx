import React from 'react';
import ActiveGame from '../ActiveGame';
import BattleUnitList from '@/../../backend/src/structures/Battle/BattleUnitList';
import BattleUnit from '@/../../backend/src/structures/BattleUnit';
import MonstersService from '@/../../backend/src/services/Monsters';

const monsterService = MonstersService.getInstance();
const generateBoard = () => {
  const unitCount = 8;
  const board = new BattleUnitList();
  while (board.size < unitCount) {
    const x = Math.floor(Math.random() * 8);
    const y = 0;
    if (board.find(unit => unit.x === x && unit.y === y)) continue;
    board.push(new BattleUnit({
      name: monsterService.getRandomUnit().name,
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
    unit.name = monsterService.getRandomUnit().name;
  }
  return board;
};

const combinedBoard = [{
  owner: 'first_player',
  units: generateBoard()
},
{
  owner: 'second_player',
  units: flipBoard(generateBoard())
}];

export default <ActiveGame props={combinedBoard} />;
