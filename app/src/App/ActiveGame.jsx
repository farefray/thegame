import React, { useEffect, useState, useReducer } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import _ from 'lodash';

import Position from '../objects/Position';
import TopBar from './ActiveGame/TopBar.jsx';
import LeftBar from './ActiveGame/LeftBar.jsx';
import Timer from './ActiveGame/Timer.jsx';
import GameBoard from './ActiveGame/GameBoard.jsx';
import { StateProvider } from './ActiveGame/GameBoard.context.js';

import GameBoardBottom from './ActiveGame/GameBoardBottom.jsx';

import RightPanel from './ActiveGame/RightPanel.jsx';

import { isUndefined } from '../f';

const { ACTION } = require('../shared/constants');

const wait = async ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

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

function ActiveGame() {
  useEffect(() => {
    console.log('ACTIVE GAME MOUNT');
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
    console.log("TCL: boardReducer -> action", action)
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

    switch (
      action.type
    ) {
      case ACTION.MOVE:
        const reducedBoard = _.clone(board); // maybe can be omitted
        console.log("TCL: boardReducer -> board", board)
        console.log("TCL: boardReducer -> fromPos", fromPos)
        const creature = _.clone(board[fromPos]);
        console.log("TCL: boardReducer -> creature", creature)
        delete reducedBoard[fromPos];

        if (toPos) {
          unitComponents[creature.position].onAction(action);
          reducedBoard[toPos] = creature;
        }

        return reducedBoard;
      case ACTION.ATTACK:
        // todo plzmake this more understandable
        unitComponents[board[fromPos].position].onAction(action);
        unitComponents[board[toPos].position].onAction(action, true);
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

    console.log('DISPATCHING GAME BOARD CUZ COMBINEDBOARD CHANGED')
    dispatchGameBoard({
      type: ACTION.INIT,
      board: combinedBoard
    });
  }, [combinedBoard]);

  useEffect(() => {
    if (!activeBattle && isActiveBattleGoing && actionStack.length) {
      setActiveBattle(true);

      const startBattleEvent = async actions => {
        let currentTime = 0;

        console.log('Starting Battle with', actions.length, 'moves');
        // Add some kind of timer here for battle countdowns (setTimeout here made dispatch not update correct state)
        while (actions.length > 0) {
          const boardAction = actions.shift(); // actionStack is mutable
          console.log("TCL: ActiveGame -> boardAction", boardAction)
          const time = boardAction.time;
          const nextRenderTime = time - currentTime; // magic time factor, fixme
          console.log("TCL: ActiveGame -> nextRenderTime", nextRenderTime)

          await wait(nextRenderTime);
          dispatchGameBoard(boardAction);

          currentTime = time;

          if (actions.length === 0) {
            console.log('END OF BATTLE: winningTeam');
            await wait(1500);

            // reset board to initial state
            dispatchGameBoard({
              type: ACTION.RESET
            });
          }
        }
      };

      startBattleEvent(_.clone(actionStack));
    } else if (activeBattle && !isActiveBattleGoing) {
      // backend sent that battle is over (isActiveBattleGoing === false), we update state on frontend
      setActiveBattle(false);
    }
    console.table([Object.keys(combinedBoard).join(','), activeBattle, isActiveBattleGoing, actionStack.length]);
  }, [combinedBoard, activeBattle, isActiveBattleGoing, actionStack]);


  // TODO move this to timer component
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    setCounter(appState.countdown);
  }, [appState.countdown]);

  const MemoizedTimer = React.useMemo(
    () => (
      <Timer
        value={counter}
        onTick={val => {
          setCounter(val);
        }}
      />
    ),
    [counter]
  );
  return (
    <div className="gameDiv" tabIndex="0">
      {' '}
      {/* <TopBar {...this.props} /> */}{' '}
      <div className="flex wholeBody">
        {' '}
        {/* <LeftBar {...this.props} /> */} {counter && MemoizedTimer}
        <StateProvider
          initialState={{
            ...appState
          }}
        >
          <GameBoard board={gameBoard} units={units} onLifecycle={dispatchUnitLifecycle} />{' '}
        </StateProvider>{' '}
        {/* <GameBoardBottom {...this.props} /> */} <RightPanel {...appState} />{' '}
      </div>{' '}
    </div>
  );
}

export default ActiveGame;
