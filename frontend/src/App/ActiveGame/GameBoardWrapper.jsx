/**
 * Logical component for gameboard
 * It's quite complex, but I cannot find any more suitable way to make it simplier
 */
import _ from 'lodash';
import React, {
  useEffect,
  useState,
  useReducer,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import GameBoard from './GameBoard.jsx';
import UnitsWrapper from './GameBoard/UnitsWrapper.jsx';

import {
  StateProvider
} from './GameBoard.context.js';
import usePrevious from '../../customhooks/usePrevious';

const uuidv1 = require('uuid/v1');

const DEBUG_MODE = process.env.REACT_APP_GAMEMODE === 'debug';
let nextActionReady = null;
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
    const {
      board
    } = action;
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
      const {
        component
      } = action;

      unitComponents[component.id].component = component;
      return unitComponents;
    }
    case 'DESTROY': {
      const {
        component
      } = action;

      // his one is a quick hotfix
      // Todo: Investigate why there's cases when no component exist.
      if (unitComponents[component.id]) {
        unitComponents[component.id].component = null;
        delete unitComponents[component.id];
      }

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
  const [count, setCount] = useState(0.0); // eslint-disable-line

  // Get all passed down props which we will use, from gameboard state
  const {
    myHand,
    myBoard,
    battleStartBoard,
    isActiveBattleGoing,
    actionStack
  } = state;

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

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const animationRef = useRef();
  const previousTimeRef = useRef();
  const animationCleanup = () => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setCount((prevCount) => {
      // reset timer for animations
      return 0;
    });
  };

  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;

      // Pass on a function to the setter of the state
      // to make sure we always have the latest state
      setCount(timePassed => {
        let possibleNextAction = actionStack[0];
        if (possibleNextAction) {
          const action = () => {
            const currentAction = actionStack.shift();
            DEBUG_MODE && console.log(currentAction);
            dispatchUnitLifecycle(currentAction);
          }

          if (DEBUG_MODE) {
            nextActionReady && action();
            nextActionReady = false;
          } else if (possibleNextAction.time <= timePassed) {
            action();
          }
        }

        return (timePassed + deltaTime)
      })
    }

    if (actionStack.length === 0) {
      // Battle is done on frontend. It's supposed to be finished nearly that time by backend also. 
      // TODO: test state change here from backend.
      console.info('Battle is done on frontend');
      return animationCleanup();
    } else {
      previousTimeRef.current = time;
      animationRef.current = requestAnimationFrame(animate);
    }
  }

  useEffect(() => {
    /** isActiveBattleGoing is redux state from backend, isBattleLaunched is internal state for this component
     * we devide those two values, because we cannot start battle immediatly when redux updated, as not all Unit components yet mounted and registered here.
     */
    if (isActiveBattleGoing && !isBattleLaunched && !wasBattleLaunched) {
      // Launch battle and update gameboard key in order to re-render units
      setBattleLaunched(true);
      setGameboardKey(gameboardKey + 1);
    } else if (isActiveBattleGoing && isBattleLaunched && !wasBattleLaunched
      && !animationRef.current) {
      // starting battle animations on frontend
      animationRef.current = requestAnimationFrame(animate);
    } else if (!isActiveBattleGoing && isBattleLaunched && wasBattleLaunched) {
      // Finished battle (isActiveBattleGoing via redux is false, while battle is running in component yet)
      setBattleLaunched(false);
      setGameboardKey(gameboardKey + 1);
    }
  }, [isActiveBattleGoing, isBattleLaunched, gameboardKey, wasBattleLaunched]);

  // stop any animations on unmount
  useEffect(() => {
    return () => {
      animationCleanup();
    }
  }, [])

  return ( <StateProvider initialState={{...state}}>
      {DEBUG_MODE && <a href="#0" onClick={ () => nextActionReady = true }>Debug next action</a>} 
      <GameBoard key={ gameboardKey } render={ boardRef =>
        <UnitsWrapper unitComponents={ unitComponents } onLifecycle={ dispatchUnitLifecycle } boardRef={ boardRef } />
      }
    /></StateProvider>);
  }

  export default GameBoardWrapper;