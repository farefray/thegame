import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';

import ActiveGame from './ActiveGame';

const GameController = require('/node_modules/backend_symlink/game.js');
const MOCK_SOCKETID_1 = 'MOCK_SOCKETID_1';
const MOCK_SOCKETID_2 = 'MOCK_SOCKETID_2';
const MOCK_SOCKETID_3 = 'MOCK_SOCKETID_3';

const MOCK_CLIENTS = [MOCK_SOCKETID_1, MOCK_SOCKETID_2, MOCK_SOCKETID_3];

const generateGameState = async function() {
	let gameState = await GameController.initialize(MOCK_CLIENTS);
	gameState = await GameController.purchasePawn(gameState, MOCK_SOCKETID_1, 0);
	const fromPosition = '0';
	const toPosition = '0,2';
	const result = await GameController.mutateStateByPawnPlacing(gameState, MOCK_SOCKETID_1, fromPosition, toPosition);
	return result;
};

// Put this somewhere central (chances are you'll have some utils thingie)
const MyReduxMock = ({ children, initialState }) => {
	return (
		<ReduxMock configureStore={state => createStore(rootReducer, state)} initialState={initialState}>
			{children}
		</ReduxMock>
	);
};

export default () => {
	generateGameState().then(result => {
		console.log(result);
	});
	return (
		<MyReduxMock initialState={rootReducer({}, { type: 'INIT' })}>
			<ActiveGame />
		</MyReduxMock>
	);
};
