import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import _ from 'lodash';
import { useDispatch } from 'react-redux'

import ActiveGame from './ActiveGame';

const ConnectedPlayers = require('../../../src/models/ConnectedPlayers.js');
const GameController = require('../../../src/game.js');
const BattleController = require('../../../src/game/battle.js');
const Customer = require('../../../src/objects/Customer.js');
const MOCK_SOCKETID_1 = 'MOCK_SOCKETID_1';

const MOCK_CLIENTS = [MOCK_SOCKETID_1];

// todo make it share functionality with jest and core.test.js
const generateGameState = async function() {
	const connectedPlayers = new ConnectedPlayers();
	connectedPlayers.set(MOCK_SOCKETID_1, new Customer(MOCK_SOCKETID_1));
	connectedPlayers.setIn(MOCK_SOCKETID_1, ['isReady', true]);
	
	let gameState = await GameController.initialize(MOCK_CLIENTS);
	gameState = await GameController.purchasePawn(gameState, MOCK_SOCKETID_1, 0);
	const fromPosition = '0';
	const toPosition = '0,2';
	await GameController.mutateStateByPawnPlacing(gameState, MOCK_SOCKETID_1, fromPosition, toPosition);
    console.log("TCL: preBattleState", gameState)
	const battleRoundResult = await BattleController.setup(gameState);
	return battleRoundResult;
};

// Put this somewhere central (chances are you'll have some utils thingie)
const MyReduxMock = ({ children, initialState }) => {
	console.log("TCL: MyReduxMock -> initialState", initialState)
	
	return (
		<ReduxMock configureStore={state => createStore(rootReducer, state)} initialState={initialState}>
			<MyReduxContext initialState={initialState}>
			{children}
			</MyReduxContext>
		</ReduxMock>
	);
};

const MyReduxContext = ({ children, initialState }) => {
	const dispatch = useDispatch();

	React.useEffect(() => {
		generateGameState().then(battleRoundResult => {
			// const newState = _.cloneDeep(initialState);
			// newState.app.actionStack = battleRoundResult.actionStack;
			// newState.app.isActiveBattleGoing = true;
			// dispatch({
			// 	type: 'DEBUG',
			// 	newState
			// });

			dispatch({ type: 'BATTLE_TIME', actionStack: battleRoundResult.battles[MOCK_SOCKETID_1].actionStack, startBoard:battleRoundResult.battles[MOCK_SOCKETID_1].startBoard, winner:battleRoundResult.battles[MOCK_SOCKETID_1].winner});
		});
	}, []);

	return children;
}

export default () => {
	const baseState = rootReducer({}, { type: 'INIT' });

	return (
		<MyReduxMock initialState={baseState}>
			<ActiveGame />
		</MyReduxMock>
	);
};
