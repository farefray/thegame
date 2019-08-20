import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import { createStore } from 'redux';

import ActiveGame from './ActiveGame';
import myMockedReduxState from '../mockedstate.json';
import rootReducer from '../reducers';

export default <ReduxMock configureStore={state => createStore(rootReducer, state)}
    initialState={myMockedReduxState} >
    <ActiveGame />
</ReduxMock>;
