/**
 * Logical component for gameboard
 * It's quite complex, but I cannot find any more suitable way to make it simplier
 */
import _ from 'lodash';
import React, { useEffect, useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import GameBoard from './GameBoard.jsx';
import { StateProvider } from './GameBoard.context.js';
import usePrevious from '../../customhooks/usePrevious';

const { ACTION } = require('../../shared/constants');

/**
 *
 * Handles previously stored actions(actionStack) as well as frontend generated events
 * contains unit itself in case its frontend generated event or unitID in case its backend event
 * @param {Object} action
 * @maybe its more performant to not use reducer hook here and hold unitComponents outside of react component like here in commit daa60d0e74d01d67232d70e69731e8c2e9e5f423
 * @returns
 */
function dispatchUnitLifecycleReducer(unitComponents, action) {
  switch (action.type) {
    // Lifecycle events which are being triggered by frontend events for Unit components
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
    // actionStack events which are being generated on backend
    case ACTION.MOVE:
    case ACTION.ATTACK:
    case ACTION.CAST:
    case ACTION.TAKE_DAMAGE:
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
 * Logical component for GameBoard
 * @param {gameboard.reducer} state
 * @returns
 */
function GameBoardWrapper({ state }) {
  /** Gameboard key is used in order to fully rebuild gameboard during rounds by changing 'key' of gameboard(to re-init units) */
  const [gameboardKey, setGameboardKey] = useState(1);

  // Get all passed down props which we will use, from gameboard state
  const { myHand, myBoard, battleStartBoard, isActiveBattleGoing, actionStack } = state;

  // Contains current board units(if thats battle, then battleStartBoard, else combination of myBoard && myHand)
  const [board, setBoard] = useState({});

  // If board is being updated by backend, update board state for this component
  useEffect(() => {
    setBoard(_.merge(isActiveBattleGoing ? battleStartBoard : myBoard, myHand));
  }, [myHand, myBoard, battleStartBoard, isActiveBattleGoing]);

  // When board is being updated, we update units [units is array of unit objects which will be later rendered into 'Unit' components]
  const [units, setUnits] = useState([]);
  // unitComponents stores children react components 'Unit' which are being rendered from 'units' array
  const [unitComponents, dispatchUnitLifecycle] = useReducer(dispatchUnitLifecycleReducer, {}); // eslint-disable-line

  // If board being updated, update units
  useEffect(() => {
    const units = Object.keys(board).map(key => {
      return {
        ...board[key],
        id: key
      };
    });

    setUnits(units);
  }, [board]);

  /** Active battle controlling for component state */
  const [isBattleLaunched, setBattleLaunched] = useState(false);

  /** We use usePrevious hook in order to get previous state value for isBattleLaunched, to know when its changed */
  const wasBattleLaunched = usePrevious(isBattleLaunched);

  useEffect(() => {
    /** isActiveBattleGoing is redux state from backend, isBattleLaunched is internal state for this component
     * we devide those two values, because we cannot start battle immediatly when redux updated, as not all Unit components yet mounted and registered here.
     */
    if (isActiveBattleGoing && !isBattleLaunched && !wasBattleLaunched) {
      // Launch battle and update gameboard key in order to re-render units
      setBattleLaunched(true);
      setGameboardKey(gameboardKey + 1);
    } else if (isActiveBattleGoing && isBattleLaunched && !wasBattleLaunched) {
      // reset internal counter, effect on this will trigger battle actions animating start
      setCurrentActionIndex(isActiveBattleGoing ? 0 : -1);
    } else if (!isActiveBattleGoing && isBattleLaunched && wasBattleLaunched) {
      // Finished battle (isActiveBattleGoing via redux is false, while battle is running in component yet)
      setBattleLaunched(false);
      setGameboardKey(gameboardKey + 1);
    }
  }, [isActiveBattleGoing, isBattleLaunched, gameboardKey, wasBattleLaunched])
  
  // Internal counters in order to go past actionStack and execute units behaviors one by one
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [prevActionIndex, setPrevActionIndex] = useState(-1);
  useEffect(() => {
    if (
      actionStack.length > 0 && // we got actions to execute
      currentActionIndex > -1 && // current action index is not initial
      currentActionIndex !== prevActionIndex // we are not yet finished
    ) {
      // we actually have battle going and gameBoard was modified by dispatchGameBoard, so we execute another actionStack action
      setPrevActionIndex(currentActionIndex);

      const actionTime = actionStack[currentActionIndex].time;
      const boardActions = actionStack.filter(action => action.time === actionTime);
      for (const action of boardActions) {
        // reducer which executes action from stack for child Unit component
        dispatchUnitLifecycle(action);
      }

      if (currentActionIndex + boardActions.length >= actionStack.length) {
        // no more actions, we could trigger winning/losing animation here
      } else {
        // Scheduling next action
        const timeoutLength = actionStack[currentActionIndex + boardActions.length].time - actionTime;

        setTimeout(() => {
          setCurrentActionIndex(currentActionIndex + boardActions.length);
        }, timeoutLength);
      }
    }
  }, [currentActionIndex, actionStack, prevActionIndex]);

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
