import React, { useReducer, useRef } from 'react';
import { useUnmount, useMount } from 'react-use';
import BattleUnitsWrapper from './BattleUnitsWrapper';

const uuidv1 = require('uuid/v1');

/**
 * Handles previously stored actions(actionStack) as well as frontend generated events
 * contains unit itself in case its frontend generated event or unitID in case its backend event
 * @param {Object} unitComponents previous state of components
 * @param {Object} action
 * @returns
 */
function dispatchUnitLifecycleReducer(unitComponents, action) {
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
      const proceedActionForUnit = (action) => {
        if (action && unitComponents[action.unitID] && unitComponents[action.unitID].component) {
          unitComponents[action.unitID].component.onAction(action).then((resolvedAction) => proceedActionForUnit(resolvedAction?.chainedAction));
        }
      };

      proceedActionForUnit(action);
      return unitComponents;
  }
}

function BattleBoardLogic({ battleStartBoard, actionStack }) {
  const _unitComponents = {}; // initial setup for unit components
  battleStartBoard.forEach((unit) => {
    _unitComponents[unit.id] = {
      ...unit,
      key: uuidv1(),
      component: null // on spawn, children components will be linked here
    };
  });

  const [unitComponents, dispatchUnitLifecycle] = useReducer(dispatchUnitLifecycleReducer, _unitComponents);

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const animationRef = useRef();
  const previousTimeRef = useRef();
  const overallBattleTimeRef = useRef();

  const animate = (time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      const possibleNextAction = actionStack[0];
      if (possibleNextAction && possibleNextAction.time <= overallBattleTimeRef.current) {
        const currentAction = actionStack.shift();
        dispatchUnitLifecycle(currentAction);
      }

      overallBattleTimeRef.current = overallBattleTimeRef.current + deltaTime;
    } else {
      overallBattleTimeRef.current = 0;
    }

    previousTimeRef.current = time;
    animationRef.current = requestAnimationFrame(animate);
  };

  useMount(() => {
    // starting battle animations on frontend
    animationRef.current = requestAnimationFrame(animate);
  });

  // stop any animations on unmount
  useUnmount(() => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    previousTimeRef.current = null;
  });

  return <BattleUnitsWrapper unitComponents={unitComponents} dispatchUnitLifecycle={dispatchUnitLifecycle.bind(this)} />;
}

export default BattleBoardLogic;
