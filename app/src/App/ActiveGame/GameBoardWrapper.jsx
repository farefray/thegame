/**
 * Logical component for gameboard
 */
import _ from 'lodash';
import React, { useEffect, useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import Position from '../../objects/Position';
import GameBoard from './GameBoard.jsx';
import { StateProvider } from './GameBoard.context.js';

const { ACTION } = require('../../shared/constants');

/**
 *
 * Handles previously stored actions(actionStack) as well as frontend generated events
 * contains unit itself in case its frontend generated event or unitID in case its backend event
 * @param {Object} action
 * @returns
 */
function dispatchUnitLifecycleReducer(unitComponents, action) {
  console.log("TCL: dispatchUnitLifecycleReducer -> unitComponents", _.cloneDeep(unitComponents));
  console.log('TCL: dispatchUnitLifecycleReducer -> action', action);

  switch (action.type) {
    // Lifecycle events which are being triggered by frontend events for Unit components
    case 'SPAWN': {
      const { unit } = action;
      unitComponents[unit.id] = unit; // very confusing, we use id here cuz its component, but later its UID cuz BattleUnit, TODO!!
      console.log('TCL: dispatchUnitLifecycle -> unitComponents', _.cloneDeep(unitComponents));
      return unitComponents;
    }
    case 'DESTROY': {
      const { unit } = action;
      delete unitComponents[unit.id];
      console.log('TCL: dispatchUnitLifecycle -> unitComponents', _.cloneDeep(unitComponents));
      return unitComponents;
    }
    // actionStack events which are being generated on backend
    case ACTION.MOVE:
      unitComponents[action.unitID].onAction(action);
      /*const fromPos = new Position(action.from.x, action.from.y).toBoardPosition(); // idiotic way for forming ID's for units and other stuff. Make it good please someone
      const toPos = action.to && new Position(action.to.x, action.to.y).toBoardPosition();
      if (toPos) {
      }*/
      return unitComponents;
    case ACTION.ATTACK:
      // todo plzmake this more understandable
      unitComponents[action.unitID].onAction(action);
      return unitComponents;
      //todo unitComponents[toPos].onAction(action, true);
      break;
    case ACTION.CAST:
      unitComponents[action.unitID].onAction(action);
      return unitComponents;
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
  /** Gameboard key is used in order to fully rebuild gameboard during rounds  */
  const [gameboardKey, setGameboardKey] = useState(1);

  // Get all passed down props which we will use
  const { myHand, myBoard, battleStartBoard, isActiveBattleGoing, actionStack } = state;

  // Contains current board units(if thats battle, then battleStartBoard, else combination of myBoard && myHand)
  const [board, setBoard] = useState({});

  // If board being updated by backend, update board for this component
  useEffect(() => {
    console.log('we update board')
    const combinedBoard = _.merge(isActiveBattleGoing ? state.battleStartBoard : state.myBoard, myHand);
    setBoard(combinedBoard);
    
    // if board is updated, increment gameboard key to fully reinitialize
    setGameboardKey(gameboardKey + 1);
  }, [myHand, myBoard, battleStartBoard, isActiveBattleGoing]);

  // When board is being updated, we update units [units is array of units which will be later rendered into Unit components which also also being stored in current state]
  const [units, setUnits] = useState([]);
  useEffect(() => {
    console.log('we update units');
    const units = Object.keys(board).map(key => {
      return {
        ...board[key],
        id: key
      };
    });

    setUnits(units);

  }, [board]);

  // unitComponents stores children react components which are being rendered from 'units'
  const [unitComponents, dispatchUnitLifecycle] = useReducer(dispatchUnitLifecycleReducer, {});

  // Internal counters in order to go past actionStack and execute units behaviors
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [prevActionIndex, setPrevActionIndex] = useState(-1);

  useEffect(() => {
    console.log('TCL: GameBoardLogic -> units', _.cloneDeep(units));
    console.log('TCL: GameBoardLogic -> unitComponents', _.cloneDeep(unitComponents));
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


  // when battle state being changed, we need to start or stop battle
  useEffect(() => {
    console.log('we are starting battle  -> isActiveBattleGoing', isActiveBattleGoing);
    
    // reset internal counter, effect on this will trigger battle actions start
    setCurrentActionIndex(isActiveBattleGoing ? 0 : -1);
    
  }, [isActiveBattleGoing]);

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
