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

const wait = async ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

var damageUnit = async (newBoard, target, value, unitPos, direction, actionMessageTarget, manaChanges, actionMessageAttacker) => {
  if (isUndefined(newBoard[target])) {
    console.log('Time to crash: ', newBoard, target, value);
  }
  if (actionMessageTarget) newBoard[target].actionMessage = actionMessageTarget;
  if (actionMessageAttacker) newBoard[unitPos].actionMessage = actionMessageAttacker;
  // console.log('direction: ' + direction)
  if (direction !== '') {
    // console.log('animate: ', direction, 'attack' + direction + ' 0.3s ease-in 0s normal 1 both running');
    /*newBoard[unitPos].animateMove = { // attackAnimation = {
      animation: 'attack' + direction + ' 0.3s', // ease-in 0s normal 1 both running',
    } */
    newBoard[unitPos].attackAnimation = 'animate' + direction;
  }
  if (newBoard[unitPos].animateMove !== '') {
    newBoard[unitPos].animateMove = '';
  }
  if (manaChanges && Object.keys(manaChanges).length) {
    Object.keys(manaChanges).forEach(e => {
      const unitPosManaChange = newBoard[e];
      const newMana = manaChanges[e];
      unitPosManaChange.mana = newMana;
    });
  }
  const newHp = newBoard[target].hp - value;
  if (newHp <= 0) {
    // TODO: Death Animation then remove
    // console.log('Attack / Dot DA');
    newBoard[target].actionMessage = '';
    newBoard[target].mana = 0;
    newBoard[target].hp = newHp;
    newBoard[target].animateMove = {
      animation: 'deathAnimation 1.0s', // TODO: Test on normal div if animation work
      animationFillMode: 'forwards'
    };
    //delete newBoard[target];
  } else {
    newBoard[target].hp = newHp;
  }
  return newBoard;
};

var renderMove = async (nextMove, board) => {
  let newBoard = board;
  // console.log('@Time: ', timeToWait, board);
  const action = nextMove.action;
  const target = nextMove.target;
  const value = nextMove.value;
  const unitPos = nextMove.unitPos;
  const typeEffective = nextMove.typeEffective;
  const direction = nextMove.direction;
  const manaChanges = nextMove.manaChanges;
  const unit = newBoard[unitPos]; // Save unit from prev pos
  switch (action) {
    case 'move':
      console.log('Move from', unitPos, 'to', target);
      delete newBoard[unitPos]; // Remove unit from previous pos
      newBoard[target] = unit; // Add unit to new pos on board
      newBoard[target].actionMessage = '';
      newBoard[target].animateMove = {
        animation: 'move' + direction + ' 0.5s'
      };
      return newBoard;
    case 'attack':
      console.log('Attack from', unitPos, 'to', target, 'with', value, 'damage');
      let actionMessage = '';
      if (typeEffective !== '') {
        // Either '' or Message
        actionMessage = '- ' + value + '! ' + typeEffective;
      } else {
        actionMessage = '- ' + value;
      }
      return this.damageUnit(newBoard, target, value, unitPos, direction, actionMessage, manaChanges);
    case 'spell':
      // TODO: Animations
      // TODO: Check spell effects
      const effect = nextMove.effect;
      const abilityName = nextMove.abilityName;
      let actionMessageTarget = '';
      let actionMessageAttacker = abilityName + '!';
      if (typeEffective !== '') {
        // Either '' or Message
        actionMessageTarget = '- ' + value + '! ' + typeEffective;
      } else {
        actionMessageTarget = '- ' + value;
      }
      if (direction !== '') {
        newBoard[unitPos].attackAnimation = 'animate' + direction;
      }
      if (newBoard[unitPos].animateMove !== '') {
        newBoard[unitPos].animateMove = '';
      }
      let newHpSpell = newBoard[target].hp;
      let damage = value;
      if (effect && Object.keys(effect).length) {
        console.log('SPELL EFFECT: ', effect);
        Object.keys(effect).forEach(e => {
          const unitPosEffect = newBoard[e];
          const effectToApplyOnUnit = effect[e];
          Object.keys(effectToApplyOnUnit).forEach(buff => {
            const typeEffect = buff;
            const valueEffect = effectToApplyOnUnit[buff];
            console.log('Found', typeEffect, 'effect with value', valueEffect, 'for unit', unitPosEffect);
            switch (typeEffect) {
              case 'multiStrike': {
                // TODO Visualize multistrike ability
                console.log('@MULTISTRIKE', damage, valueEffect, 'new Damage', damage * valueEffect, 'hp', newHpSpell);
                damage *= valueEffect;
                actionMessageTarget = actionMessageTarget + '! Hit ' + valueEffect + ' times!';
                break;
              }
              case 'teleport':
              case 'noTarget':
                damage = 0;
                break;
              case 'dot': {
                // TODO Visualize 'dot' is applied to unit

                actionMessageTarget = actionMessageTarget + '! Dot applied';
                break;
              }
              case 'heal': {
                if (unitPosEffect === target) {
                  console.log('Enemy Heal (SHOULDNT OCCUR)');
                  newHpSpell += valueEffect;
                } else {
                  console.log('Normal heal');
                  newBoard[e].hp = newBoard[e].hp + valueEffect;
                  actionMessageAttacker = actionMessageAttacker + '! Heal for ' + valueEffect;
                }
                break;
              }
              // case buffs, not required in theory for attack or defence, since not visible
              default:
            }
          });
        });
      }
      newHpSpell -= damage;
      console.log('Spell (' + abilityName + ') from', unitPos, 'to', target, 'with', value, 'damage, newHp', newHpSpell, effect ? effect : '');
      if (newHpSpell <= 0) {
        // console.log('Spell DA');
        newBoard[target].hp = newHpSpell;
        newBoard[target].animateMove = {
          animation: 'deathAnimation 1.0s', // TODO: Test on normal div if animation work
          animationFillMode: 'forwards'
        };
      } else {
        newBoard[target].hp = newHpSpell;
        newBoard[target].actionMessage = actionMessageTarget;
      }
      newBoard[unitPos].actionMessage = actionMessageAttacker;
      return newBoard;
    case 'dotDamage':
      // TODO: Animate Poison Damage on unitPos
      console.log('Poison damage on', unitPos, 'with', value, 'damage');
      actionMessage = '- ' + value + ' Dot!';
      return this.damageUnit(newBoard, target, value, unitPos, direction, actionMessage);
    default:
      console.log('error action = ', action, nextMove);
      return board;
  }
};

const ACTION_MOVE = 1; // todo share with backend
const ACTION_ATTACK = 2;

const allUnits = {}; // todo move into state

const onSpawn = unit => {
console.log("TCL: unit", unit)
  allUnits[unit.id] = unit;
};

const onDestroy = unitToRemove => {
  console.log('TCL: unitToRemove', unitToRemove);
  delete allUnits[unitToRemove.id];
  console.log('TCL: allUnits', allUnits);
};

function boardReducer(board, action) {
  for (let id in allUnits) {
    if (allUnits.hasOwnProperty(id)) {
      const unit = allUnits[id];
      console.log("TCL: boardReducer -> unit", unit)
      if (action.from && unit.state.x === action.from.x && unit.state.y === action.from.y) {
        unit.onAction(action);
      } else if (action.to && unit.state.x === action.to.x && unit.state.y === action.to.y) {
        unit.onAction(action, true);
      }
    }
  }

  switch (
    action.action // todo make it type
  ) {
    case 'INIT': {
      return _.cloneDeep(action.board);
    }
    case ACTION_MOVE:
      const reducedBoard = _.clone(board);
      const boardPos = new Position(action.from.x, action.from.y).toBoardPosition(); // todo make board already contain Positions
      const creature = _.clone(board[boardPos]);
      delete reducedBoard[boardPos];

      if (action.to) {
        reducedBoard[new Position(action.to.x, action.to.y).toBoardPosition()] = creature;
      }

      return reducedBoard;
    case ACTION_ATTACK:
      console.log('TCL: boardReducer -> action', action);

      return _.clone(board);
    default:
      throw new Error();
  }
}

function ActiveGame() {
  useEffect(() => {
    console.log('ACTIVE GAME MOUNT');
  }, []);

  const [activeBattle, setActiveBattle] = useState(false);
  const [units, setUnits] = useState([]);
  /*
		index, players, player, myHand, myShop, myBoard, isActiveBattleGoing, isBattle, enemyIndex, roundType, actionStack, battleStartBoard, winner, dmgBoard, isDead, boardBuffs, unitJson, visiting, gold 
	*/
  const appState = useSelector(state => state.app, shallowEqual);
  const { isActiveBattleGoing, actionStack } = appState;

  const combineBoard = () => {
    const boardMap = isActiveBattleGoing ? appState.battleStartBoard : appState.myBoard;
    return _.merge(boardMap, appState.myHand);
  };

  const combinedBoard = combineBoard();

  const [gameBoard, dispatchGameBoard] = useReducer(boardReducer, combinedBoard);

  useEffect(() => {
    if (!activeBattle && isActiveBattleGoing && actionStack.length) {
      setActiveBattle(true);

      const startBattleEvent = async actions => {
        let currentTime = 0;

        console.log('Starting Battle with', actions.length, 'moves');
        // Add some kind of timer here for battle countdowns (setTimeout here made dispatch not update correct state)
        while (actions.length > 0) {
          const boardAction = actions.shift(); // actionStack is mutable
          const time = boardAction.time;
          const nextRenderTime = time - currentTime; // magic time factor, fixme

          await wait(nextRenderTime);
          dispatchGameBoard(boardAction);

          currentTime = time;

          if (actions.length === 0) {
            console.log('END OF BATTLE: winningTeam');
            await wait(1500);
          }
        }
      };

      startBattleEvent(_.clone(actionStack));
    }
  }, [activeBattle, isActiveBattleGoing, actionStack]);

  useEffect(() => {
    console.log('dispatchGameBoard!!');
    const units = Object.keys(combinedBoard).map(key => {
      return {
        ...combinedBoard[key],
        id: key
      };
    });
    console.log('TCL: ActiveGame -> units', units);

    setUnits(units);

    dispatchGameBoard({
      action: 'INIT',
      board: combinedBoard
    });
  }, [combinedBoard]);

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
          <GameBoard board={gameBoard} units={units} onSpawn={onSpawn} onDestroy={onDestroy} />{' '}
        </StateProvider>{' '}
        {/* <GameBoardBottom {...this.props} /> */} <RightPanel {...appState} />{' '}
      </div>{' '}
    </div>
  );
}

export default ActiveGame;
