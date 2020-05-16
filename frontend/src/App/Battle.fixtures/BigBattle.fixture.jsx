import React from 'react';
import ActiveGame from '../ActiveGame';
import monsterUtils from '@/../../backend/src/utils/monsterUtils';
import BattleUnitList from '@/../../backend/src/objects/BattleUnit/BattleUnitList';
import BattleUnit from '@/../../backend/src/objects/BattleUnit';

const generateBoard = () => {
  const unitCount = 8;
  const board = new BattleUnitList();
  while (board.size < unitCount) {
    const x = Math.floor(Math.random() * 8);
    const y = 0;
    if (board.find(unit => unit.x === x && unit.y === y)) continue;
    board.push(new BattleUnit({
      name: monsterUtils.getRandomUnit().name,
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
    unit.name = monsterUtils.getRandomUnit().name;
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
