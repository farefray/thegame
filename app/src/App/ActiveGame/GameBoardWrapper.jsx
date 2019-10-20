import _ from 'lodash';
import React, { useEffect, useState, useReducer } from 'react';
import Position from '../../objects/Position';
import GameBoard from './GameBoard.jsx';
import { StateProvider } from './GameBoard.context.js';

const { ACTION } = require('../../shared/constants');

function unitReducer(unitComponents, action) {
  switch (action.type) {
    case 'SPAWN': {
      const { unit } = action;
      unitComponents[unit.id] = unit; // very confusing, we use id here cuz its component, but later its UID cuz BattleUnit, TODO!!
      return unitComponents;
    }
    case 'DESTROY': {
      const { unit } = action;
      delete unitComponents[unit.id];
      return unitComponents;
    }
    default: {
      // init
      return _.cloneDeep(action.unitComponents); // maybe not need to clone
    }
  }
}

function GameBoardWrapper({ state }) {
  const [activeBattle, setActiveBattle] = useState(false);
  const [units, setUnits] = useState([]);
  const [unitComponents, dispatchUnitLifecycle] = useReducer(unitReducer, {});
  const { isActiveBattleGoing, actionStack } = state;
  
  // useEffect(() => {
  //   setActiveBattle(isActiveBattleGoing)
  // }, [isActiveBattleGoing])

  const combineBoard = () => {
    const boardMap = isActiveBattleGoing ? state.battleStartBoard : state.myBoard;
    return _.merge(boardMap, state.myHand);
  };

  let combinedBoard = combineBoard();

  const boardReducer = (board, action) => {
    if (action.type === ACTION.INIT) {
      return _.cloneDeep(action.board);
    } else if (action.type === ACTION.RESET) {
      // todo this is being triggered twise, need to fix.

      // As react wont rerender our units, we reset their positions to initial
      for (let id in unitComponents) {
        const unit = unitComponents[id];
        unit.onAction(action);
      }

      // also board getting resetted to initial state
      const clonedBoard = _.cloneDeep(combinedBoard); // maybe can be omitted and wont require cloning
      return clonedBoard;
    }

    const fromPos = new Position(action.from.x, action.from.y).toBoardPosition(); // idiotic way for forming ID's for units and other stuff. Make it good please someone
    const toPos = action.to && new Position(action.to.x, action.to.y).toBoardPosition();

    switch (action.type) {
      case ACTION.MOVE:
        const reducedBoard = _.cloneDeep(board); // maybe can be omitted
        const creature = _.clone(board[fromPos]);
        if (!creature) {
          return reducedBoard;
        }

        delete reducedBoard[fromPos];
        if (toPos) {
          unitComponents[creature._uid].onAction(action);
          reducedBoard[toPos] = creature;
        }

        return reducedBoard;
      case ACTION.ATTACK:
        // todo plzmake this more understandable
        if (!board[fromPos] || !board[toPos]) {
          return board;
        }

        unitComponents[board[fromPos].position].onAction(action);
        unitComponents[board[toPos].position].onAction(action, true);
        return _.clone(board);
      case ACTION.CAST:
        unitComponents[board[fromPos].position].onAction(action);
        return _.clone(board);
      default:
        throw new Error();
    }
  };

  const [gameBoard, dispatchGameBoard] = useReducer(boardReducer, combinedBoard);

  useEffect(() => {
    const units = Object.keys(combinedBoard).map(key => {
      return {
        ...combinedBoard[key],
        id: key
      };
    });

    setUnits(units);

    dispatchGameBoard({
      type: ACTION.INIT,
      board: combinedBoard
    });
  }, [combinedBoard]);

  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [prevActionIndex, setPrevActionIndex] = useState(-1);
  useEffect(() => {
    if (!activeBattle && isActiveBattleGoing && actionStack.length) {
      setActiveBattle(true);

      setCurrentActionIndex(0);
    } else if (activeBattle && !isActiveBattleGoing) {
      // backend sent that battle is over (isActiveBattleGoing === false), we update state on frontend
      setActiveBattle(false);
    } else if (activeBattle && isActiveBattleGoing && actionStack.length > 0 && currentActionIndex > -1 && currentActionIndex !== prevActionIndex) {
      // we actually have battle going and gameBoard was modified by dispatchGameBoard, so we execute another actionStack action
      setPrevActionIndex(currentActionIndex);

      const actionTime = actionStack[currentActionIndex].time;
      const boardActions = actionStack.filter(action => action.time === actionTime);
      for (const action of boardActions) {
        dispatchGameBoard(action);
      }
      if (currentActionIndex + boardActions.length >= actionStack.length) {
        setTimeout(
          () =>
            dispatchGameBoard({
              type: ACTION.RESET
            }),
          1000
        );
      } else {
        const timeoutLength = actionStack[currentActionIndex + boardActions.length].time - actionTime;

        setTimeout(() => {
          setCurrentActionIndex(currentActionIndex + boardActions.length);
        }, timeoutLength);
      }
    }
  }, [gameBoard, currentActionIndex]); // eslint-disable-line

  return <StateProvider
            initialState={{
              ...state
            }}
          >
            <GameBoard board={gameBoard} units={units} onLifecycle={dispatchUnitLifecycle} />
          </StateProvider>;
}

export default GameBoardWrapper;
