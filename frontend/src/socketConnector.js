// src/socketConnector.js
import io from 'socket.io-client';

/**
 * ToDo implement socket.io Manager for reconnections and so on.
 */
const url = window.location.href;
const ip = url.split(':3000')[0].split('http://')[1];
const ipAdress = process.env.NODE_ENV === 'production' ? 'https://thegame-backend.herokuapp.com/' : 'http://' + ip + '';
console.log('Connecting to ' + ipAdress + ' ...');
const socket = io(ipAdress);

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
    dispatch({ type: 'UPDATED_STATE', state });
  });

  socket.on('UPDATE_PLAYER', (player) => {
    dispatch({ type: 'UPDATE_PLAYER', player: player });
  });

  socket.on('NOTIFICATION', (index, notification) => {
    dispatch({ type: 'NOTIFICATION', index: index, notification: notification });
  });

  socket.on('INITIALIZE', index => {
    dispatch({ type: 'INITIALIZE', index: index });
  });

  socket.on('START_BATTLE', ({ actionStack, startBoard, winner, countdown }) => {
    dispatch({ type: 'START_BATTLE', actionStack, startBoard, winner, countdown });
  });

  socket.on('END_GAME', winningPlayer => {
    dispatch({ type: 'END_GAME', winningPlayer });
    setTimeout(() => {
      window.location.reload();
    }, 60000);
  });

  socket.on('DEAD_PLAYER', (pid, position) => {
    dispatch({ type: 'DEAD_PLAYER', pid, position });
  });

  return socket;
};


// the following are functions that our client side uses
// to emit actions to everyone connected to our web socket

SocketConnector.login = (customerData) => new Promise((resolve) => {
  socket.emit('CUSTOMER_LOGIN_TRY', customerData, (response) => {
    resolve(response);
  });
});

SocketConnector.startGame = () => {
  socket.emit('START_GAME');
}

SocketConnector.purchaseUnit = (unitIndex) => {
  socket.emit('PURCHASE_UNIT', unitIndex);
}

SocketConnector.placePiece = (fromBoardPosition, toBoardPosition) => {
  socket.emit('PLACE_PIECE', fromBoardPosition, toBoardPosition);
}

SocketConnector.sellPiece = (fromBoardPosition) => {
  socket.emit('SELL_PIECE', fromBoardPosition);
}

export { SocketConnector };
