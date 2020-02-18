/**
 * Logical component for gameboard
 * It's quite complex, but I cannot find any more suitable way to make it simplier
 */
import _ from 'lodash';
import React, { useEffect, useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import GameBoard from './GameBoard.jsx';
import UnitsWrapper from './GameBoard/UnitsWrapper.jsx';

import { StateProvider } from './GameBoard.context.js';
import usePrevious from '../../customhooks/usePrevious';

const uuidv1 = require('uuid/v1');
/**
 * Handles previously stored actions(actionStack) as well as frontend generated events
 * contains unit itself in case its frontend generated event or unitID in case its backend event
 * @param {Object} unitComponents previous state of components
 * @param {Object} action
 * @returns
 */
function dispatchUnitLifecycleReducer(unitComponents, action) {
  if (action.type === 'BOARD_UPDATE') {
    const _unitComponents = {};
    const { board } = action;
    for (const pos in board) {
      const unit = board[pos];
      _unitComponents[pos] = {
        ...unit,
        key: uuidv1(),
        component: null
      };
    }

    return _unitComponents;
  }

  switch (action.type) {
    // Lifecycle events which are being triggered by frontend events for Unit components
    case 'SPAWN': {
      const { component } = action;

      unitComponents[component.id].component = component;
      return unitComponents;
    }
    case 'DESTROY': {
      const { component } = action;

      unitComponents[component.id].component = null;
      delete unitComponents[component.id];
      return unitComponents;
    }
    // actionStack events which are being generated on backend
    default:
      // Since our frontend is animated with timeouts, there might be huge delays and battle could be already finished by backend, while its not yet rendered properly on frontend. Thats why we check if component is still exists :)
      if (unitComponents[action.unitID] && unitComponents[action.unitID].component) {
        unitComponents[action.unitID].component.onAction(action);
      }

      return unitComponents;
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

  // When board is being updated, we update units [units is object which will be later rendered into 'Unit' components and saved into ref into that array, also processing unit actions and events by this ref]
  const [unitComponents, dispatchUnitLifecycle] = useReducer(dispatchUnitLifecycleReducer, {});

  // If board being updated, update units to re-render them
  useEffect(() => {
    dispatchUnitLifecycle({
      type: 'BOARD_UPDATE',
      board
    });
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
  }, [isActiveBattleGoing, isBattleLaunched, gameboardKey, wasBattleLaunched]);

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
      <GameBoard key={gameboardKey} render={
        boardRef => 
          <UnitsWrapper unitComponents={unitComponents} onLifecycle={dispatchUnitLifecycle} boardRef={boardRef} />
      } />
    </StateProvider>
  );
}

export default GameBoardWrapper;
