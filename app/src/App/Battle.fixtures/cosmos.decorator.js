import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import Battle from '../../../../src/objects/Battle.js';
import createBattleBoard from '../../../../src/utils/createBattleBoard';

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

const generateGameState = async function(board) {
  const combinedBoard = createBattleBoard(board.A, board.B);
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

const MyReduxContext = ({ children, deco }) => {
  const dispatch = useDispatch();
  const board = deco.children.props.props; // I have no idea why its like that, but it works
  React.useEffect(() => {
    generateGameState(board).then(battleRoundResult => {
      dispatch({
        type: 'START_BATTLE',
        actionStack: battleRoundResult.actionStack,
        startBoard: battleRoundResult.startBoard,
        winner: battleRoundResult.winner
      });
    });
  }, []);

  return children;
};
export default ({ children }) => (
  <MyReduxMock>
    <MyReduxContext deco={children.props}>{children}</MyReduxContext>
  </MyReduxMock>
);