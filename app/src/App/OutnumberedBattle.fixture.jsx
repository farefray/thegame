import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import ActiveGame from './ActiveGame';
import Battle from '../../../src/objects/Battle.js';

const BoardJS = require('../../../src/controllers/board.js');

// todo make it share functionality with jest and core.test.js
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

const generateGameState = async function({ boards }) {
  const npcBoard = await BoardJS.createBoard(boards.A);
  const playerBoard = await BoardJS.createBoard(boards.B);

  const combinedBoard = await BoardJS.createBattleBoard(playerBoard, npcBoard);
  const battleResult = new Battle(combinedBoard);
  return JSON.parse(JSON.stringify(battleResult, getCircularReplacer()));
};

const generateBoard = () => {
  const unitCount = 12;
  const board = [];
  while (board.length < unitCount) {
    const x = Math.floor(Math.random() * 8);
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
  A: [
    {
      name: 'bigboy',
      x: 4,
      y: 2
    }
  ],
  B: flipBoard(generateBoard())
};

const MyReduxMock = ({ children }) => {
  const initialState = rootReducer({}, { type: 'INIT' });

  return (
    <ReduxMock configureStore={state => createStore(rootReducer, state)} initialState={initialState}>
      {children}
    </ReduxMock>
  );
};

const MyReduxContext = ({ boards }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    generateGameState(boards).then(battleRoundResult => {
      dispatch({
        type: 'BATTLE_TIME',
        actionStack: battleRoundResult.actionStack,
        startBoard: battleRoundResult.startBoard,
        winner: battleRoundResult.winner
      });
    });
  }, []);

  return <ActiveGame />;
};

const Fixture = boards => {
  return (
    <MyReduxMock>
      <MyReduxContext boards={boards} />
    </MyReduxMock>
  );
};

export default <Fixture boards={combinedBoard} />;
