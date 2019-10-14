// src/socketConnector.js
import io from 'socket.io-client';

const url = window.location.href;
const ip = url.split(':3000')[0].split('http://')[1];
const ipAdress = 'http://' + ip + ':8000';
console.log('Connecting to ' + ipAdress + ' ...');
const socket = io(ipAdress);

export async function AjaxGetUnitJson(cb) {
  console.log('Fetching json from ' + ipAdress + '/unitJson');
  fetch(ipAdress + '/unitJson', {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain'
    }
  })
    .then(async response => {
      // console.log(response);
      const result = await response.json();
      // console.log(result);
      cb(result.mosntersJSON);
    })
    .catch(err => {
      console.log('Failed to fetch', err);
    });
}

/** Socket connector for frontend
 * Handles connection to backend and sends events born in browser to backend.
 * Only sends customer events to backend and then application receives app state with redux update!
 */
const SocketConnector = {};

// Initialization and setting up socket events
SocketConnector.init = function (dispatch) {
  // make sure our socket is connected to the port
  socket.on('connect', () => {
    console.log('Socket connected');
    dispatch({ type: 'SET_CONNECTED', isConnected: true });
    socket.emit('ON_CONNECTION');
  });

  socket.on('disconnect', () => {
    dispatch({ type: 'SET_CONNECTED', isConnected: false });
    window.location.reload();
    console.log('disconnected');
  });

  socket.on('CUSTOMER_LOGIN_SUCCESS', customer => {
    dispatch({ type: 'CUSTOMER_LOGIN_SUCCESS', customer });
  });

  socket.on('UPDATED_STATE', state => {
    dispatch({ type: 'UPDATED_STATE', newState: state });
  });

  socket.on('SET_ONGOING_BATTLE', (value, timer) => {
    dispatch({ type: 'SET_ONGOING_BATTLE', value: value, countdown: timer / 1000 });
  });

  socket.on('UPDATE_PLAYER', (index, player) => {
    console.log('socket on update player');
    dispatch({ type: 'UPDATE_PLAYER', index: index, player: player });
  });

  socket.on('LOCK_TOGGLED', (index, lock) => {
    dispatch({ type: 'LOCK_TOGGLED', index: index, lock: lock });
  });

  socket.on('ADD_PLAYER', index => {
    dispatch({ type: 'ADD_PLAYER', index: index });
  });

  socket.on('BATTLE_TIME', (actionStack, startBoard, winner) => {
    console.log(actionStack, startBoard, winner);
    dispatch({ type: 'BATTLE_TIME', actionStack, startBoard, winner });
  });

  /// ???
  socket.on('END_BATTLE', (upcomingRoundType, upcomingGymLeader) => {
    if (upcomingGymLeader) {
      dispatch({ type: 'END_BATTLE', upcomingRoundType, upcomingGymLeader });
    } else {
      dispatch({ type: 'END_BATTLE', upcomingRoundType });
    }
    setTimeout(() => {
      dispatch({ type: 'CLEAR_TICKS' });
    }, 5000);
    setTimeout(() => {
      dispatch({ type: 'TOGGLE_SHOW_DMGBOARD' });
    }, 10000);
  });

  socket.on('END_GAME', winningPlayer => {
    dispatch({ type: 'END_GAME', winningPlayer });
    setTimeout(() => {
      window.location.reload();
    }, 60000);
  });

  socket.on('SET_STATS', (name, stats) => {
    dispatch({ type: 'SET_STATS', name, stats });
  });

  socket.on('NEW_CHAT_MESSAGE', (senderMessage, message, type) => {
    dispatch({ type: 'NEW_CHAT_MESSAGE', senderMessage, newMessage: message, chatType: type });
  });

  socket.on('DEAD_PLAYER', (pid, position) => {
    dispatch({ type: 'DEAD_PLAYER', pid, position });
  });

  return socket;
};

SocketConnector.login = (customerData) => new Promise((resolve) => {
  socket.emit('CUSTOMER_LOGIN_TRY', customerData, (response) => {
    resolve(response);
  });
});

SocketConnector.startRoundVsAI = () => {
  socket.emit('START_AI');
}

SocketConnector.purchaseUnit = (unitIndex) => {
  socket.emit('PURCHASE_UNIT', unitIndex);
}


export { SocketConnector };

// the following are functions that our client side uses
// to emit actions to everyone connected to our web socket
export const startGame = () => socket.emit('START_GAME');

export const toggleLock = state => socket.emit('TOGGLE_LOCK', state);


export const buyExp = state => socket.emit('BUY_EXP', state);

export const refreshShop = state => socket.emit('REFRESH_SHOP', state);

export const placePiece = (fromBoardPosition, toBoardPosition) => socket.emit('PLACE_PIECE', fromBoardPosition, toBoardPosition);

export const withdrawPiece = (state, from) => socket.emit('WITHDRAW_PIECE', state, from);

export const sellPiece = (state, from) => socket.emit('SELL_PIECE', state, from);

export const getStats = name => socket.emit('GET_STATS', name);

export const sendMessage = message => socket.emit('SEND_MESSAGE', message);

export const getSprites = () => socket.emit('GET_SPRITES');
