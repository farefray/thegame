import React, { useEffect, useState } from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../../reducers';
import { createStore } from 'redux';
import RightSidebar from './RightSidebar';
import GameController from '../../../../backend/src/controllers/GameController';

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
  state = await GameController.purchasePawn(state, PLAYER_INDEX, 0);
  return JSON.parse(JSON.stringify(state, getCircularReplacer()));
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
