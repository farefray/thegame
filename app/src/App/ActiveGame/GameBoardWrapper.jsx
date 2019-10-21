/**
 * Logical component for gameboard
 */
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Position from '../../objects/Position';
import GameBoard from './GameBoard.jsx';
import { StateProvider } from './GameBoard.context.js';

const { ACTION } = require('../../shared/constants');

var unitComponents = {};
/**
 *
 * Handles previously stored actions(actionStack) as well as frontend generated events
 * contains unit itself in case its frontend generated event or unitID in case its backend event
 * @param {Object} action
 * @returns
 */
function dispatchUnitLifecycle(action) {
  console.log('TCL: dispatchUnitLifecycle -> action', action);

  switch (action.type) {
    // Lifecycle events which are being triggered by frontend events for Unit components
    case 'SPAWN': {
      const { unit } = action;
      unitComponents[unit.id] = unit; // very confusing, we use id here cuz its component, but later its UID cuz BattleUnit, TODO!!
      console.log('TCL: dispatchUnitLifecycle -> unitComponents', _.cloneDeep(unitComponents));
      break;
    }
    case 'DESTROY': {
      const { unit } = action;
      delete unitComponents[unit.id];
      console.log('TCL: dispatchUnitLifecycle -> unitComponents', _.cloneDeep(unitComponents));
      break;
    }
    // actionStack events which are being generated on backend
    case ACTION.MOVE:
      unitComponents[action.unitID].onAction(action);
      /*const fromPos = new Position(action.from.x, action.from.y).toBoardPosition(); // idiotic way for forming ID's for units and other stuff. Make it good please someone
      const toPos = action.to && new Position(action.to.x, action.to.y).toBoardPosition();
      if (toPos) {
      }*/
      break;
    case ACTION.ATTACK:
      // todo plzmake this more understandable
      unitComponents[action.unitID].onAction(action);
      return;
      //todo unitComponents[toPos].onAction(action, true);
      break;
    case ACTION.CAST:
      unitComponents[action.unitID].onAction(action);
      break;
    default:
      throw new Error();
  }
}

GameBoardWrapper.propTypes = {
  state: PropTypes.shape({
    isActiveBattleGoing: PropTypes.bool,
    actionStack: PropTypes.array,
    battleStartBoard: PropTypes.objectOf(PropTypes.object),
    myHand: PropTypes.objectOf(PropTypes.object),
    myBoard: PropTypes.objectOf(PropTypes.object)
  })
};

/**
 *
 *
 * @param {gameboard.reducer} state
 * @returns
 */
function GameBoardWrapper({ state }) {
  // Get all passed down props which we will use
  const { myHand, myBoard, battleStartBoard, isActiveBattleGoing, actionStack } = state;

  // Contains current board units(if thats battle, then battleStartBoard, else combination of myBoard && myHand)
  const [board, setBoard] = useState({});

  // If board being updated by backend, update board for this component
  useEffect(() => {
    console.log('board satte updated, go for effects');
    const combinedBoard = _.merge(isActiveBattleGoing ? state.battleStartBoard : state.myBoard, myHand);
    setBoard(combinedBoard);
    console.log('TCL: GameBoardLogic -> combinedBoard', _.cloneDeep(combinedBoard));
  }, [myHand, myBoard, battleStartBoard, isActiveBattleGoing]);

  // When board is being updated, we update units
  const [units, setUnits] = useState([]);
  useEffect(() => {
    console.log('board was updated, lets update units');
    const units = Object.keys(board).map(key => {
      return {
        ...board[key],
        id: key
      };
    });

    setUnits(units);
    console.log('TCL: GameBoardLogic -> units', _.cloneDeep(units));
  }, [board]);

  // Internal counters in order to go past actionStack and execute units behaviors
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [prevActionIndex, setPrevActionIndex] = useState(-1);

  /** Gameboard key is used in order to fully rebuild gameboard during rounds  */
  const [gameboardKey, setGameboardKey] = useState(1);

  // when battle state being changed, we need to start or stop battle
  useEffect(() => {
    console.log('TCL: GameBoardLogic -> isActiveBattleGoing', isActiveBattleGoing);
    // if battle started, increment gameboard key to fully reinitialize
    setGameboardKey(gameboardKey + 1);
    // reset internal counter, effect on this will trigger battle actions start
    setTimeout(() => {
      (() => {
        // we execute this in next tick
        setCurrentActionIndex(isActiveBattleGoing ? 0 : -1)
      })();
    }, 100);
    
  }, [isActiveBattleGoing]);

  useEffect(() => {
    if (
        actionStack.length > 0 // we got actions to execute
        && currentActionIndex > -1 // current action index is not initial
        && currentActionIndex !== prevActionIndex // we are not yet finished
      ) {
      console.log('battle tick, currentActionIndex:', currentActionIndex);
      // we actually have battle going and gameBoard was modified by dispatchGameBoard, so we execute another actionStack action
      setPrevActionIndex(currentActionIndex);

      const actionTime = actionStack[currentActionIndex].time;
      const boardActions = actionStack.filter(action => action.time === actionTime);
      for (const action of boardActions) {
        dispatchUnitLifecycle(action);
      }

      if (currentActionIndex + boardActions.length >= actionStack.length) {
        console.log('action reset was here');
      } else {
        const timeoutLength = actionStack[currentActionIndex + boardActions.length].time - actionTime;

        setTimeout(() => {
          setCurrentActionIndex(currentActionIndex + boardActions.length);
        }, timeoutLength);
      }
    }
  }, [currentActionIndex]);

  return (
    <StateProvider
      initialState={{
        ...state
      }}
    >
      <GameBoard key={gameboardKey} units={units} onLifecycle={dispatchUnitLifecycle} />
    </StateProvider>
  );
}

export default GameBoardWrapper;
