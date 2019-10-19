import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import ActiveGame from './ActiveGame';
import GameController from '../../../src/controllers/GameController.js';


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

const PLAYER_INDEX = -1;

const generateGameState = async function() {
  let state = await GameController.initialize([PLAYER_INDEX]);
  state = await GameController.purchasePawn(state, PLAYER_INDEX, 0);
  return JSON.parse(JSON.stringify(state, getCircularReplacer()));
};

const MyReduxContext = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    generateGameState().then(newState => {
      dispatch({
        type: 'UPDATE_PLAYER',
        index: PLAYER_INDEX,
        player: newState.players[PLAYER_INDEX]
      });
    });
  }, [dispatch]);

  return <ActiveGame />;
};

const MyReduxMock = ({ children }) => {
  const initialState = rootReducer({}, { type: 'INIT' });

  return (
    <ReduxMock configureStore={state => createStore(rootReducer, state)} initialState={initialState}>
      {children}
    </ReduxMock>
  );
};

const Fixture = () => {
  return (
    <MyReduxMock>
      <MyReduxContext />
    </MyReduxMock>
  );
};

export default <Fixture />;
