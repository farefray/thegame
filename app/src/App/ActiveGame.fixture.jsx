import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import _ from 'lodash';

import ActiveGame from './ActiveGame';

const GameController = require('../../../src/game.js');
const BattleJS = require('../../../src/game/battle.js');
const Battle = require('../../../src/objects/Battle.js');
const BoardJS = require('../../../src/game/board.js');
const MOCK_SOCKETID_1 = 'MOCK_SOCKETID_1';
const MOCK_SOCKETID_2 = 'MOCK_SOCKETID_2';
const MOCK_SOCKETID_3 = 'MOCK_SOCKETID_3';

const MOCK_CLIENTS = [MOCK_SOCKETID_1, MOCK_SOCKETID_2, MOCK_SOCKETID_3];

const generateGameState = async function() {
	const npcBoard = await BoardJS.createBoard([
		{
			name: 'minotaur',
			x: 1,
			y: 8
		}
	]);
	const playerBoard = await BoardJS.createBoard([
		{
			name: 'minotaur',
			x: 3,
			y: 4
		}
	]);

	const combinedBoard = await BoardJS.createBattleBoard(playerBoard, npcBoard);
	const battle = new Battle(combinedBoard);
	const battleResult = await battle.execute();
	return battleResult;
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
	const [state, setState] = React.useState(rootReducer({}, { type: 'INIT' }));

	generateGameState().then(result => {
		const newState = _.cloneDeep(state);
		newState.app.battleStartBoard = result.startBoard;
		newState.app.actionStack = result.actionStack;
		setState(newState);
		console.log('TCL: newState', newState);
	});

	return (
		<MyReduxMock initialState={state}>
			<ActiveGame />
		</MyReduxMock>
	);
};
