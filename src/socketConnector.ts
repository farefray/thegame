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



//     socket.on('UPDATED_STATE', (state) => {
//       dispatch({ type: 'UPDATED_STATE', state });
//     });

//     socket.on('UPDATE_PLAYER', (player) => {
//       dispatch({ type: 'UPDATE_PLAYER', player: player });
//     });

//     socket.on('NOTIFICATION', (index, notification) => {
//       dispatch({ type: 'NOTIFICATION', index: index, notification: notification });
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
