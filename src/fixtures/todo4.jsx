import React from 'react';
import ActiveGame from '../ActiveGame';
import BattleUnitList from '@/../../backend/src/structures/Battle/BattleUnitList';
import BattleUnit from '@/../../backend/src/structures/BattleUnit';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';

const cardsFactory = new CardsFactory();
const generateBoard = () => {
  const unitCount = 8;
  const board = new BattleUnitList();
  while (board.size < unitCount) {
    const x = Math.floor(Math.random() * 8);
    const y = 0;
    if (board.find(unit => unit.x === x && unit.y === y)) continue;
    const randomCardName = cardsFactory.getRandomCardName();

    board.push(new BattleUnit({
      name: randomCardName,
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
    unit.name = cardsFactory.getRandomCardName();
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
