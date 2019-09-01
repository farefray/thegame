import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import ActiveGame from './ActiveGame';
import Battle from '../../../src/objects/Battle.js';

const BoardJS = require('../../../src/game/board.js');

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
  const battle = new Battle(combinedBoard);
  const battleResult = await battle.execute();
  return JSON.parse(JSON.stringify(battleResult, getCircularReplacer()));
};

const generateBoard = () => {
  const unitCount = 7;
  const board = [];
  while (board.length < unitCount) {
    const x = Math.floor(Math.random() * 8);
    const y = Math.floor(Math.random() * 4) + 1;
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
    unit.y = 9 - unit.y;
    unit.x = 7 - unit.x;
  }
  return board;
};

const combinedBoard = {
  A: generateBoard(),
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
