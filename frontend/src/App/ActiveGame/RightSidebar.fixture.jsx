import React, { useEffect, useState } from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import RightSidebar from './RightSidebar';
import State from '../../../../backend/src/objects/State';

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
  let state = new State([PLAYER_INDEX]);
  state.getPlayer(PLAYER_INDEX).purchasePawn(0);
  return state && JSON.parse(JSON.stringify(state, getCircularReplacer()));
};

const MyReduxContext = () => {
  const [data, setData] = useState();
  useEffect(() => {
    const runEffect = async () => {
      const data = await generateGameState();
      setData(data);
    };
    runEffect();
  }, [setData]);

  return data ? <RightSidebar {...data.players[PLAYER_INDEX]} /> : <div>Loading</div>;
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
