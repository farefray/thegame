import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import Battle from '../../../src/objects/Battle.js';
import createBattleBoard from '../../../src/utils/createBattleBoard';

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

const generateBattle = async function({ boards }) {
  const combinedBoard = createBattleBoard(boards.A, boards.B);
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

const MyReduxContext = ({ boards, children }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    generateBattle(boards).then(battleRoundResult => {
      dispatch({
        type: 'BATTLE_TIME',
        actionStack: battleRoundResult.actionStack,
        startBoard: battleRoundResult.startBoard,
        winner: battleRoundResult.winner
      });
    });
  }, []);

  return {children};
};

const Fixture = ({boards, children}) => {
  return (
    <MyReduxMock>
      <MyReduxContext boards={boards}>{children}</MyReduxContext>
    </MyReduxMock>
  );
};

export default ({ children, defaultBoard }) => <Fixture boards={defaultBoard}>{children} </Fixture>;