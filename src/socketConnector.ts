import React, { createContext } from 'react';

// import io from 'socket.io-client';

// const WebSocketContext = createContext(null)

// class SocketConnector {
//   private dispatch: Function;
//   private endpoint: string;
//   private socket;

//   constructor(dispatch: Function) {
//     this.dispatch = dispatch;
//     this.endpoint = isProduction ? 'https://thegame-backend.herokuapp.com/' : 'http://' + window.location.href.split(':3000')[0].split('http://')[1] + '';

//     console.log('Connecting to ' + this.endpoint + ' ...');
//     const socket = io(this.endpoint);
//     socket.on('connect', () => {
//       console.log('Socket connected');
//       dispatch({ type: 'SET_CONNECTED', isConnected: true });
//       socket.emit('ON_CONNECTION');
//     });

//     socket.on('disconnect', () => {
//       dispatch({ type: 'SET_CONNECTED', isConnected: false });
//       window.location.reload();
//       console.log('disconnected');
//     });

//     socket.on('IS_READY', (isReady) => {
//       dispatch({ type: 'SET_READY', isReady });
//     });

//     socket.on('UPDATED_STATE', (state) => {
//       dispatch({ type: 'UPDATED_STATE', state });
//     });

//     socket.on('UPDATE_PLAYER', (player) => {
//       dispatch({ type: 'UPDATE_PLAYER', player: player });
//     });

//     socket.on('NOTIFICATION', (index, notification) => {
//       dispatch({ type: 'NOTIFICATION', index: index, notification: notification });
//     });

//     socket.on('INITIALIZE', (index) => {
//       dispatch({ type: 'INITIALIZE', index: index });
//     });

//     socket.on('START_BATTLE', ({ actionStack, startBoard, winner, countdown }) => {
//       dispatch({ type: 'START_BATTLE', actionStack, startBoard, winner, countdown });
//     });

//     socket.on('END_GAME', (winningPlayer) => {
//       dispatch({ type: 'END_GAME', winningPlayer });
//       setTimeout(() => {
//         window.location.reload();
//       }, 60000);
//     });

//     socket.on('DEAD_PLAYER', (pid, position) => {
//       dispatch({ type: 'DEAD_PLAYER', pid, position });
//     });

//     this.socket = socket;
//   }
// }

// // the following are functions that our client side uses
// // to emit actions to everyone connected to our web socket


// SocketConnector.startGame = () => {
//   // Thats actualyl emits start event on backend
//   // TODO investigate if this can be abused, maybe we need another approach or at least validation
//   socket.emit('START_GAME');
// };

// SocketConnector.ready = () => {
//   socket.emit('PLAYER_READY', (data) => {
//     console.log('SocketConnector.ready -> data', data);
//   });
// };

// SocketConnector.purchaseUnit = (unitIndex) => {
//   socket.emit('PURCHASE_UNIT', unitIndex);
// };

// SocketConnector.placePiece = (fromBoardPosition, toBoardPosition) => {
//   socket.emit('PLACE_PIECE', fromBoardPosition, toBoardPosition);
// };

// SocketConnector.sellPiece = (fromBoardPosition) => {
//   socket.emit('SELL_PIECE', fromBoardPosition);
// };

// export { SocketConnector };
