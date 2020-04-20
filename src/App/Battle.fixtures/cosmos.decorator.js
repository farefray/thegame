/**
 * Decorator to imitate battle for Cosmos. Purely for testing, so dont mind code quality :)
 */
import React from 'react';
import _ from 'lodash';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import BattleController from '../../../../backend/src/controllers/BattleController';
import createBattleBoard from '../../../../backend/src/utils/createBattleBoard.ts';

const generateGameState = async function(boardDefinition) {
  const combinedBoard = createBattleBoard(...boardDefinition);
  const battleResult = await BattleController.setupBattle(combinedBoard);
  console.log("battleResult", battleResult)
  const result = _.cloneDeep(battleResult);
  console.log(_.cloneDeep(battleResult.actionStack));

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
  const board = deco.children.props.props; // I have no idea why its like that, but it works (thats props passed to fixture)
  React.useEffect(() => {
    if (board.type && board.type === 'START_BATTLE') { // if whole state is already sent as prop
      dispatch(board);
    } else {
      // generate state for battle
      generateGameState(board).then(battleRoundResult => {
        const state = JSON.stringify({
          type: 'START_BATTLE',
          ...battleRoundResult
        });
        dispatch(JSON.parse(state));
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
};

export default ({ children }) => (
  <MyReduxMock>
    <MyReduxContext deco={children.props}>{children}</MyReduxContext>
  </MyReduxMock>
);
