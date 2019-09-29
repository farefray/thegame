import React, { useEffect, useState, useReducer } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import _ from 'lodash';

import Position from '../objects/Position';
import Timer from './ActiveGame/Timer.jsx';
import GameBoard from './ActiveGame/GameBoard.jsx';
import { StateProvider } from './ActiveGame/GameBoard.context.js';

import { ParticleSystemComponent } from '../lib/advancedParticles/ParticleSystemComponent.js';
import { Vector2f } from '../lib/advancedParticles/Vector2f';
import { FlameThrower } from '../lib/advancedParticles/Custom/FlameThrower';

import RightPanel from './ActiveGame/RightPanel.jsx';

const { ACTION } = require('../shared/constants');

function unitReducer(unitComponents, action) {
  switch (action.type) {
    case 'SPAWN': {
      const { unit } = action;
      unitComponents[unit.id] = unit;
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

var castSpell = function(fromPosition, toPosition) {
  const unitV = new Vector2f(fromPosition.vectorX(), fromPosition.vectorY());
  const targetV = new Vector2f(toPosition.vectorX(), toPosition.vectorY());
  new FlameThrower(unitV, targetV);
};

function ActiveGame() {
  useEffect(() => {
    //console.log('ACTIVE GAME MOUNT');
  }, []);

  const [activeBattle, setActiveBattle] = useState(false);
  const [units, setUnits] = useState([]);
  const [unitComponents, dispatchUnitLifecycle] = useReducer(unitReducer, {});
  /*
	index, players, player, myHand, myShop, myBoard, isActiveBattleGoing, isBattle, enemyIndex, roundType, actionStack, battleStartBoard, winner, dmgBoard, isDead, boardBuffs, unitJson, visiting, gold 
*/
  const appState = useSelector(state => state.app, shallowEqual);
  const { isActiveBattleGoing, actionStack } = appState;

  const combineBoard = () => {
    const boardMap = isActiveBattleGoing ? appState.battleStartBoard : appState.myBoard;
    return _.merge(boardMap, appState.myHand);
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

    const fromPos = new Position(action.from.x, action.from.y).toString(); // idiotic way for forming ID's for units and other stuff. Make it good please someone
    const toPos = action.to && new Position(action.to.x, action.to.y).toString();

    switch (action.type) {
      case ACTION.MOVE:
        const reducedBoard = _.cloneDeep(board); // maybe can be omitted
        const creature = _.clone(board[fromPos]);
        if (!creature) {
          return reducedBoard;
        }

        delete reducedBoard[fromPos];

        if (toPos) {
          unitComponents[creature.position].onAction(action);
          reducedBoard[toPos] = creature;
        }

        return reducedBoard;
      case ACTION.ATTACK:
        if (!board[fromPos]) {
          throw new Error('Attempting to attack after death')
        }

        unitComponents[board[fromPos].position].onAction(action);

        if (toPos && board[toPos]) {
          unitComponents[board[toPos].position].onAction(action, true);
        }
        return _.clone(board);
      case ACTION.CAST: {
        castSpell(new Position(fromPos), new Position(toPos));
        return;
      }
      default:
        console.log(action);
        throw new Error('Unknown action in battle!');
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

  return (
    <div className="gameDiv" tabIndex="0">
      {' '}
      {/* <TopBar {...this.props} /> */}{' '}
      <div className="flex wholeBody">
        {' '}
        {/* <LeftBar {...this.props} /> */} <Timer value={appState.countdown} />{' '}
        <StateProvider
          initialState={{
            ...appState
          }}
        >
          <GameBoard board={gameBoard} units={units} onLifecycle={dispatchUnitLifecycle} >
            <ParticleSystemComponent />
          </GameBoard> 
        </StateProvider>{' '}
        {/* <GameBoardBottom {...this.props} /> */} <RightPanel {...appState} />{' '}
      </div>{' '}
    </div>
  );
}

export default ActiveGame;
