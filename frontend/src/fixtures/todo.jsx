import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '@/reducers';
import { createStore } from 'redux';
import { useDispatch } from 'react-redux';
import ActiveGame from '../App/ActiveGame';
import State from '../../../backend/src/structures/State';

import { Container } from '../../../backend/node_modules/typedi'; // to use same DI container as backend
import Position from 'shared/Position';

const mockedEventEmitter = {
  emit: (...args) => {
    window.info("mockedEventEmitter args", args)
  }
};

Container.set('event.bus', mockedEventEmitter);

const PLAYER_INDEX = 0;

const generateGameState = async function() {
  const state = new State([PLAYER_INDEX]);
  const player = state.getPlayer(PLAYER_INDEX);
  player.gold = 5;
  player.purchasePawn(0);
  player.moveUnitBetweenPositions(new Position({ x: 0, y: -1 }), new Position({ x: 0, y: 1 }));
  player.purchasePawn(1);
  return state && state.toSocket();
};

const MyReduxContext = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    generateGameState().then(newState => {
      newState.index = PLAYER_INDEX;
      console.log("MyReduxContext -> newState", newState)
      dispatch({
        type: 'UPDATED_STATE',
        newState: newState
      });

      const player = newState.players[PLAYER_INDEX];
      // const unit = player.board[0];
      console.log("MyReduxContext -> player", player)
      dispatch({
        type: 'UPDATE_PLAYER',
        player: player
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
