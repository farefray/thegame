import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import Battle from '../../../src/objects/Battle.js';
import ActiveGame from './ActiveGame';
const { ACTION } = require('../shared/constants');
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
      name: 'elf',
      x: 0,
      y: 0
    }
  ],
  B: [
    {
      name: 'elf',
      x: 7,
      y: 7
    }
  ]
};

const generateGameState = async function({ boards, params }) {
  const npcBoard = await BoardJS.createBoard(boards.A);
  const playerBoard = await BoardJS.createBoard(boards.B);

  const combinedBoard = await BoardJS.createBattleBoard(playerBoard, npcBoard);
  const battleResult = new Battle(combinedBoard);
  // now dirty emulate battleResult with a lot of particles :)
  const actionStack = [];
  let timestamp = 5000;
  for (let index = 0; index < 100; index++) {
    timestamp++;
    actionStack.push({
      type: params.isSpell ? ACTION.CAST : ACTION.ATTACK,
      damage: 0,
      from: {
        x: defaultBoard.A[0].x,
        y: defaultBoard.A[0].y
      },
      to: {
        x: defaultBoard.B[0].x, // Math.random() * 7, // defaultBoard.B[0].x,
        y: defaultBoard.B[0].y // Math.random() * 7, // defaultBoard.B[0].y
      },
      time: timestamp
    })
  }
  battleResult.actionStack = actionStack;
  console.log("TCL: battleResult", battleResult)
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

const MyReduxContext = ({ boards, params }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    generateGameState(boards, params).then(battleRoundResult => {
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

const Fixture = (boards, params) => {
  return (
    <MyReduxMock>
      <MyReduxContext boards={boards} params={params} />
    </MyReduxMock>
  );
};

export default <Fixture boards={defaultBoard} params={{
  isSpell: true
}}/>;
