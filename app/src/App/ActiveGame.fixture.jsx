import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import rootReducer from '../reducers';
import { createStore } from 'redux';
import _ from 'lodash';
import { useDispatch } from 'react-redux';

import ActiveGame from './ActiveGame';

const BoardJS = require('../../../src/game/board.js');
const Battle = require('../../../src/objects/Battle.js');

// todo make it share functionality with jest and core.test.js
const generateGameState = async function(boards) {
	const npcBoard = await BoardJS.createBoard(boards.A);
	const playerBoard = await BoardJS.createBoard(boards.B);

	const combinedBoard = await BoardJS.createBattleBoard(playerBoard, npcBoard);
	const battle = new Battle(combinedBoard);
	const battleResult = await battle.execute();
	return battleResult;
};

const MyReduxMock = ({ children, initialState, boards }) => {
	return (
		<ReduxMock configureStore={state => createStore(rootReducer, state)} initialState={initialState}>
			<MyReduxContext initialState={initialState} boards={boards}>
				{children}
			</MyReduxContext>
		</ReduxMock>
	);
};

const MyReduxContext = ({ children, initialState, boards }) => {
	const dispatch = useDispatch();

	React.useEffect(() => {
		generateGameState(boards).then(battleRoundResult => {
			console.log('TCL: MyReduxContext -> battleRoundResult', battleRoundResult);
			const newState = _.cloneDeep(initialState);
			dispatch({
				type: 'DEBUG',
				newState
			});

			dispatch({
				type: 'BATTLE_TIME',
				actionStack: battleRoundResult.actionStack,
				startBoard: battleRoundResult.startBoard,
				winner: battleRoundResult.winner
			});
		});
	}, []);

	return children;
};

export default () => {
	const baseState = rootReducer({}, { type: 'INIT' });

	const [boards, setBoards] = React.useState({
		A: [
			{
				name: 'minotaur',
				x: 1,
				y: 8
			}
		],
		B: [
			{
				name: 'minotaur',
				x: 3,
				y: 4
			}
		]
	});

	return (
		<MyReduxMock initialState={baseState} boards={boards}>
			<ActiveGame />
		</MyReduxMock>
	);
};
