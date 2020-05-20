import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '@/reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import ActiveGame from '../ActiveGame';
import State from '../../../../backend/src/objects/State';


const PLAYER_INDEX = -1;

const generateGameState = async function() {
  let state = new State([PLAYER_INDEX]);
  state.getPlayer(PLAYER_INDEX).purchasePawn(0);
  return state && state.toSocket();
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
