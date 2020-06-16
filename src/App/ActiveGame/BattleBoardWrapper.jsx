import React, { useEffect, useState, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { useUnmount, useMount } from 'react-use';
import GameBoard from './GameBoard.jsx';
import UnitsWrapper from './GameBoard/UnitsWrapper.jsx';

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

    if (board && board.length) {
      board.forEach((unit) => {
        _unitComponents[unit.id] = {
          ...unit,
          key: uuidv1(),
          component: null
        };
      });
    }

    return _unitComponents;
  }

  switch (action.type) {
    // Lifecycle events which are being triggered by frontend events for Unit components
    case 'SPAWN': {
      const { component } = action;

      unitComponents[component.id] && (unitComponents[component.id].component = component);
      return unitComponents;
    }
    case 'DESTROY': {
      const { component } = action;

      // this one is a quick hotfix
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
      const proceedActionForUnit = (action) => {
        if (action && unitComponents[action.unitID] && unitComponents[action.unitID].component) {
          unitComponents[action.unitID].component.onAction(action).then((resolvedAction) => proceedActionForUnit(resolvedAction?.chainedAction));
        }
      };

      proceedActionForUnit(action);

      return unitComponents;
  }
}

BattleBoardWrapper.propTypes = {
  gameboardState: PropTypes.shape({
    actionStack: PropTypes.array,
    battleStartBoard: PropTypes.arrayOf(PropTypes.object)
  })
};

/**
 * Logical component for GameBoard
 * @param {gameboard.reducer} gameboardState
 * @returns
 */
function BattleBoardWrapper({ gameboardState }) {
  // used to determine battle run time and sync animation
  const [, setCount] = useState(0.0);

  // Get all passed down props which we will use, from gameboard state
  const { battleStartBoard, actionStack } = gameboardState;

  // When board is being updated, we update units [units is object which will be later rendered into 'Unit' components and saved into ref into that array, also processing unit actions and events by this ref]
  const [unitComponents, dispatchUnitLifecycle] = useReducer(dispatchUnitLifecycleReducer, {});

  // If board being updated(active battle start/finish), update units to re-render them
  useMount(() => {
    console.log('board update hook');
    dispatchUnitLifecycle({
      type: 'BOARD_UPDATE',
      board: battleStartBoard
    });
  });

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const animationRef = useRef();
  const previousTimeRef = useRef();
  const animationCleanup = () => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    previousTimeRef.current = null;
  };

  useMount(() => {
    console.log('before animate hook');
    const animate = (time) => {
      console.log('animate function itself');
      // Pass on a function to the setter of the state
      // to make sure we always have the latest state
      setCount((timePassed) => {
        if (!!previousTimeRef.current) {
          const deltaTime = time - previousTimeRef.current;
          let possibleNextAction = actionStack[0];
          if (possibleNextAction) {
            const action = () => {
              const currentAction = actionStack.shift();
              // process.env.REACT_APP_DEBUGMODE && console.log(currentAction);
              dispatchUnitLifecycle(currentAction);
            };

            if (possibleNextAction.time <= timePassed) {
              action();
            }
          }

          return timePassed + deltaTime;
        } else {
          // Nulled time in order for next round to use timePassed correctly
          return 0.0;
        }
      });

      if (actionStack.length === 0 && previousTimeRef.current) {
        // last iteration to null out time
        previousTimeRef.current = null;
      } else if (actionStack.length === 0 && !previousTimeRef.current) {
        // Battle is done on frontend. It's supposed to be finished nearly that time by backend also.
        // TODO: test state change here from backend.
        return animationCleanup();
      } else {
        previousTimeRef.current = time;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // starting battle animations on frontend
    animationRef.current = requestAnimationFrame(animate);
  });

  // stop any animations on unmount
  useUnmount(() => animationCleanup());

  return (
    <React.Fragment>
      <GameBoard hasDnD={false} render={(boardRef) => <UnitsWrapper unitComponents={unitComponents} onLifecycle={dispatchUnitLifecycle} boardRef={boardRef} />} width="8" height="8" />
    </React.Fragment>
  );
}

export default BattleBoardWrapper;
