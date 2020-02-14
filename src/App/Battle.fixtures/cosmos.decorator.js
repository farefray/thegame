import React from 'react';
import _ from 'lodash';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import Battle from '../../../../backend/src/objects/Battle.ts';
import createBattleBoard from '../../../../backend/src/utils/createBattleBoard.ts';

const generateGameState = async function(board) {
  const combinedBoard = createBattleBoard({ units: board.A }, { units: board.B });
  const battleResult = new Battle({ board: combinedBoard });
  const result = _.cloneDeep(battleResult);
  console.table(battleResult.actionStack);
  return { ...result, actionStack: battleResult.actionStack };
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
      dispatch(JSON.parse(JSON.stringify({
        type: 'START_BATTLE',
        actionStack: battleRoundResult.actionStack,
        startBoard: battleRoundResult.startBoard,
        winner: battleRoundResult.winner,
        countdown: battleRoundResult.battleTime
      })));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
};
export default ({ children }) => (
  <MyReduxMock>
    <MyReduxContext deco={children.props}>{children}</MyReduxContext>
  </MyReduxMock>
);
