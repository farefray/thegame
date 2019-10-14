import { toggleLock, buyUnit, refreshShop, buyExp, placePiece, withdrawPiece, sellPiece, getStats } from './socketConnector';
import { updateMessage } from './f';
import { getSoundEffect } from './audio.js';

export function getStatsEvent(props, name) {
  if (props.statsMap[name]) {
    console.log('Cached info');
    props.dispatch({ type: 'SET_STATS', name: name, stats: props.statsMap[name] });
  } else {
    getStats(name);
  }
}
export function refreshShopEvent(props) {
  // You have enough money to refresh
  if (props.isDead) {
    updateMessage(props, 'You are dead! No shop interaction when dead', 'error');
    props.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  }
  if (!props.isActiveBattleGoing && props.isBattle) {
    updateMessage(props, 'Waiting ...', 'error');
    return;
  }
  if (props.gold >= 2) {
    refreshShop(props.storedState);
  } else {
    updateMessage(props, 'Not enough gold!', 'error');
    props.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
  }
}

export function toggleLockEvent(props) {
  if (props.isDead) {
    updateMessage(props, 'You are dead! No shop interaction when dead', 'error');
    props.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  }
  if (!props.isActiveBattleGoing && props.isBattle) {
    updateMessage(props, 'Waiting ...', 'error');
    return;
  }
  toggleLock(props.storedState);
}

export function buyExpEvent(props) {
  // You have enough money to buy exp
  if (props.isDead) {
    updateMessage(props, 'You are dead! No exp buying when dead', 'error');
    props.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  }
  if (!props.isActiveBattleGoing && props.isBattle) {
    updateMessage(props, 'Waiting ...', 'error');
    return;
  }
  if (props.gold >= 5) {
    if (props.level < 10) {
      buyExp(props.storedState);
    } else {
      updateMessage(props, 'Already at max level!', 'error');
      props.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    }
  } else {
    updateMessage(props, 'Not enough gold!', 'error');
    props.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
  }
}

// TODO DRY placepieceevent
export function canMovePiece(prop, fromParam, to) {
  const from = String(fromParam);
  if (prop.isDead) {
    return false;
  } else if (prop.visiting !== prop.index) {
    return false;
  }

  if (!prop.isActiveBattleGoing && prop.isBattle) {
    return false;
  }

  if (from && to) {
    const splitted = to.split(',');
    const fromSplitted = from.split(',');
    const validPos = (splitted.length === 2 ? splitted[1] < 4 && splitted[1] >= 0 : true) && splitted[0] < 8 && splitted[0] >= 0;
    const unitExists = fromSplitted.length === 2 ? prop.myBoard[fromParam] : prop.myHand[from];
    // console.log('@placePieceEvent', fromSplitted, validPos, unitExists, prop.myHand);
    if (validPos && unitExists && !prop.isActiveBattleGoing) {
      // console.log('Sending place piece!')
      return true;
    } else {
      // Hand to hand movement during battle allowed
      if (validPos && unitExists && prop.isActiveBattleGoing && !from.includes(',') && !to.includes(',')) {
        return true;
      } else {
        return false;
      }
    }
  }
}

export function placePieceEvent(prop, fromParam, to) {
  // to is on valid part of the board
  const from = String(fromParam);
  if (prop.isDead) {
    updateMessage(prop, 'You are dead!', 'error');
    prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  } else if (prop.visiting !== prop.index) {
    updateMessage(prop, 'Visiting!', 'error');
    prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  }
  if (!prop.isActiveBattleGoing && prop.isBattle) {
    updateMessage(prop, 'Waiting ...', 'error');
    return;
  }
  if (from && to) {
    console.log('@placePieceEvent', from, to);
    const splitted = to.split(',');
    const fromSplitted = from.split(',');
    const validPos = (splitted.length === 2 ? splitted[1] < 4 && splitted[1] >= 0 : true) && splitted[0] < 8 && splitted[0] >= 0;
    const unitExists = fromSplitted.length === 2 ? prop.myBoard[fromParam] : prop.myHand[from];
    // console.log('@placePieceEvent', fromSplitted, validPos, unitExists, prop.myHand);
    if (validPos && unitExists && !prop.isActiveBattleGoing) {
      // console.log('Sending place piece!')
      placePiece(from, to);
      prop.dispatch({ type: 'SELECT_UNIT', selectedUnit: { pos: '' } });
    } else {
      // Hand to hand movement during battle allowed
      if (validPos && unitExists && prop.isActiveBattleGoing && !from.includes(',') && !to.includes(',')) {
        placePiece(from, to);
        prop.dispatch({ type: 'SELECT_UNIT', selectedUnit: { pos: '' } });
      } else {
        updateMessage(prop, 'Invalid target placing!', 'error');
        prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
      }
    }
  }
}

export function withdrawPieceEvent(prop, from) {
  // Hand is not full
  if (prop.isDead) {
    updateMessage(prop, 'You are dead!', 'error');
    prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  } else if (prop.visiting !== prop.index) {
    updateMessage(prop, 'Visiting!', 'error');
    prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  }
  if (!prop.isActiveBattleGoing && prop.isBattle) {
    updateMessage(prop, 'Waiting ...', 'error');
    return;
  }
  const size = Object.keys(prop.myHand).length;
  if (prop.myBoard[from] && !prop.isActiveBattleGoing) {
    // From contains unit
    if (size < 8) {
      withdrawPiece(prop.storedState, String(from));
      prop.dispatch({ type: 'SELECT_UNIT', selectedUnit: { pos: '' } });
    } else {
      updateMessage(prop, 'Hand is full!', 'error');
      prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    }
  }
}

export function sellPieceEvent(prop, from) {
  if (prop.isDead) {
    updateMessage(prop, 'You are dead!', 'error');
    prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  } else if (prop.visiting !== prop.index) {
    updateMessage(prop, 'Visiting!', 'error');
    prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
    return;
  }
  if (!prop.isActiveBattleGoing && prop.isBattle) {
    updateMessage(prop, 'Waiting ...', 'error');
    return;
  }
  const validUnit = prop.selectedUnit.isBoard ? prop.myBoard[from] : prop.myHand[from];
  console.log('@sellPiece', validUnit, from, prop.selectedUnit.isBoard);
  // From contains unit, hand unit is ok during battle
  // TODO: Remove false && and fix allowing sellPiece during battle, currently weird
  if (validUnit && (!prop.isActiveBattleGoing || !prop.selectedUnit.isBoard)) {
    // false &&
    sellPiece(prop.storedState, String(from));
    prop.dispatch({ type: 'SELECT_UNIT', selectedUnit: { pos: '' } });
    prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('sellUnit') });
  } else {
    updateMessage(prop, 'Invalid target to sell! ' + from, 'error');
    prop.dispatch({ type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('invalid') });
  }
}
