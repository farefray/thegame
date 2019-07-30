import React, { useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux'

import TopBar from './ActiveGame/TopBar.jsx';
import LeftBar from './ActiveGame/LeftBar.jsx';
import Timer from './ActiveGame/Timer.jsx';
import GameBoard from './ActiveGame/GameBoard.jsx';
import { StateProvider } from './ActiveGame/GameBoard.context.js';

import GameBoardBottom from './ActiveGame/GameBoardBottom.jsx';

import RightPanel from './ActiveGame/RightPanel.jsx';

import { isUndefined, updateMessage } from '../f';
import { getSoundEffect } from '../audio.js';

const TIME_FACTOR = 15;

const wait = async (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

var removeClassAnimation = (nextMove, board) => {
  const unitPos = nextMove.unitPos;
  if (board && board[unitPos]) {
    board[unitPos].attackAnimation = '';
  }
  return board;
}

var endOfBattleClean = (battleBoard, winner) => {
  const unitsAlive = Object.keys(battleBoard);
  for (let i = 0; i < unitsAlive.length; i++) {
    // Jumping animation
    if (battleBoard[unitsAlive[i]].hp > 0 && battleBoard[unitsAlive[i]].team === (winner ? 0 : 1)) {
      battleBoard[unitsAlive[i]].winningAnimation = true;
      // console.log('Setting winningAnimation', unitsAlive[i], battleBoard[unitsAlive[i]]);
      battleBoard[unitsAlive[i]].actionMessage = '';
    } else {
      // console.log('HEY', battleBoard[unitsAlive[i]].hp > 0, battleBoard[unitsAlive[i]].team === (winner ? 0 : 1), battleBoard[unitsAlive[i]].hp > 0 && battleBoard[unitsAlive[i]].team === (winner ? 0 : 1));
      // delete battleBoard[unitsAlive[i]]; 
    }
  }
  return battleBoard;
}



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
      animationFillMode: 'forwards',
    };
    //delete newBoard[target]; 
  } else {
    newBoard[target].hp = newHp;
  }
  return newBoard;
}

var startBattleEvent = async () => {
  const { dispatch, actionStack, battleStartBoard, winner } = this.props;
  if (this.props.isDead && this.props.visiting === this.props.index) {
    return;
  }
  const currentRound = this.props.round;
  dispatch({ type: 'CHANGE_STARTBATTLE', value: false });
  let board = battleStartBoard
  let currentTime = 0;

  console.log('Starting Battle with', actionStack.length, 'moves');
  // Add some kind of timer here for battle countdowns (setTimeout here made dispatch not update correct state)
  let counter = 0;
  while (actionStack.length > 0) {
    if (currentRound < this.props.round) {
      return;
    }
    const nextMove = actionStack.shift(); // actionStack is mutable
    const time = nextMove.time;
    const nextRenderTime = (time - currentTime) * TIME_FACTOR; // magic time factor, fixme
    if (isUndefined(board)) {
      console.log('CHECK ME: Board is undefined', board, nextMove, nextRenderTime);
    }
    await this.wait(nextRenderTime);
    // Fix remove class Animation
    board = await this.removeClassAnimation(nextMove, board);
    dispatch({ type: 'UPDATE_BATTLEBOARD', board, moveNumber: counter });
    board = await this.removeActionMessage(nextMove, board);
    dispatch({ type: 'UPDATE_BATTLEBOARD', board, moveNumber: counter });
    board = await this.renderMove(nextMove, board);

    // console.log('Next action in', nextRenderTime, '(', currentTime, time, ')')
    currentTime = time;
    dispatch({ type: 'UPDATE_BATTLEBOARD', board, moveNumber: counter });
    counter += 1;
    if (actionStack.length === 0) {
      await this.wait(1500);
      if (currentRound < this.props.round) {
        return;
      }
      board = await this.endOfBattleClean(battleStartBoard, winner);
      dispatch({ type: 'UPDATE_BATTLEBOARD', board, moveNumber: 'Ended' });
      // console.log('END OF BATTLE: winningTeam', winningTeam, 'x', Object.values(battleStartBoard));
      if (winner) {
        updateMessage(this.props, 'Battle won!', 'big');
        dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('cheer') });
      } else {
        updateMessage(this.props, 'Battle lost!', 'big');
        dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('battleLose') });
      }
    }
  }
}



var removeActionMessage = (nextMove, board) => {
  const target = nextMove.target;
  if (board && board[target]) {
    board[target].actionMessage = '';
    /*
    const obj = {...board[target], actionMessage: ''}
    const keys = Object.keys(board);
    return keys.map((key, index) => {
      if (index !== target) {
        // This isn't the item we care about - keep it as-is
        return board[key]
      }
      // Otherwise, this is the one we want - return an updated value
      return {
        ...obj,
      }
    })*/
  }
  return board;
}

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
  const unit = newBoard[unitPos];  // Save unit from prev pos
  switch (action) {
    case 'move':
      console.log('Move from', unitPos, 'to', target);
      delete newBoard[unitPos];        // Remove unit from previous pos
      newBoard[target] = unit;         // Add unit to new pos on board
      newBoard[target].actionMessage = '';
      newBoard[target].animateMove = {
        animation: 'move' + direction + ' 0.5s',
      };
      return newBoard;
    case 'attack':
      console.log('Attack from', unitPos, 'to', target, 'with', value, 'damage');
      let actionMessage = '';
      if (typeEffective !== '') { // Either '' or Message
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
      if (typeEffective !== '') { // Either '' or Message
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

                actionMessageTarget = actionMessageTarget + '! Dot applied'
                break;
              }
              case 'heal': {
                if (unitPosEffect === target) {
                  console.log('Enemy Heal (SHOULDNT OCCUR)')
                  newHpSpell += valueEffect;
                } else {
                  console.log('Normal heal')
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
      console.log('Spell (' + abilityName + ') from', unitPos, 'to', target, 'with', value, 'damage, newHp', newHpSpell, (effect ? effect : ''));
      if (newHpSpell <= 0) {
        // console.log('Spell DA');
        newBoard[target].hp = newHpSpell;
        newBoard[target].animateMove = {
          animation: 'deathAnimation 1.0s', // TODO: Test on normal div if animation work
          animationFillMode: 'forwards',
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
}

var visitPlayer = (playerIndex) => {
  console.log('Visiting Player', playerIndex, '...')
  this.props.dispatch({ type: 'SPEC_PLAYER', playerIndex })
}


function ActiveGame (props) {
  const activeBattle = false;
  
  
  /*
   index, storedState, players, player, myHand, myShop, myBoard, onGoingBattle, isBattle, enemyIndex, roundType, startBattle, actionStack, battleStartBoard, winner, dmgBoard, isDead, boardBuffs, unitJson, visiting, gold 
  */
  const appState = useSelector(state => state.app, shallowEqual);
  /* TODO start battle from hooks */
  /*
  if (this.props.startBattle === true && !this.state.activeBattle) {
      this.setState({ ...this.state, activeBattle: true })
      this.startBattleEvent();
    }
    */

  const reducer = (state, action) => {
    // not sure if it will be required. State changes should be done by direct socket calls, one by one, updating whole state if required.
    console.log('ActiveGame state reducer');
    console.log(action);
    return state;
  };

  return (<div className='gameDiv' tabIndex='0'>
    {/* <TopBar {...this.props} /> */}
    <div className='flex wholeBody'>
      {/* <LeftBar {...this.props} /> */}
      {appState.countdown > 0 && <Timer initialValue={appState.countdown} />}
      <StateProvider initialState={{...appState}} reducer={reducer}>
        <GameBoard />
      </StateProvider>
      {/* <GameBoardBottom {...this.props} /> */}
      <RightPanel {...appState} />
    </div>
  </div>);
}

export default ActiveGame;
