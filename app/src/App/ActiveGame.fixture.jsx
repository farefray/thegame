import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import Battle from '../../../src/objects/Battle.js';
import ActiveGame from './ActiveGame';

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

const defaultBoard = {
  A: [
    {
      name: 'minotaur',
      x: 0,
      y: 8
    },
    {
      name: 'minotaur',
      x: 0,
      y: 7
    },
    {
      name: 'minotaur',
      x: 0,
      y: 6
    }
  ],
  B: [
    {
      name: 'minotaur',
      x: 0,
      y: 1
    }
  ]
};

const generateGameState = async function({ boards }) {
  const npcBoard = await BoardJS.createBoard(boards.A);
  const playerBoard = await BoardJS.createBoard(boards.B);

  const combinedBoard = await BoardJS.createBattleBoard(playerBoard, npcBoard);
  const battleResult = new Battle(combinedBoard);
  return JSON.parse(JSON.stringify(battleResult, getCircularReplacer()));
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

export default <Fixture boards={defaultBoard} />;
