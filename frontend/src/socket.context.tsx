import React, { createContext } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';

const WebSocketContext = createContext(null);
const isProduction = process.env.NODE_ENV === 'production';

export { WebSocketContext };

export default ({ children }) => {
  let socket;
  let ws;
  let endpoint = isProduction ? 'https://thegame-backend.herokuapp.com/' : 'http://' + window.location.href.split(':3000')[0].split('http://')[1] + '';

  const dispatch = useDispatch();

  const emitMessage = (type, payload) => {
    console.log("emitMessage -> type", type)
    return new Promise((resolve) => {
      socket.emit(type, payload, (response) => {
        resolve(response);
      });
    });
  };

  if (!socket) {
    socket = io.connect(endpoint);

    // socket listeners
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

    socket.on('CUSTOMER_LOGIN_SUCCESS', (customer) => {
      dispatch({ type: 'CUSTOMER_LOGIN_SUCCESS', customer });
    });

    socket.on('IS_READY', (isReady) => {
      dispatch({ type: 'SET_READY', isReady });
    });

    socket.on('UPDATED_STATE', (state) => {
      dispatch({ type: 'UPDATED_STATE', state });
    });

    socket.on('UPDATE_PLAYER', (player) => {
      dispatch({ type: 'UPDATE_PLAYER', player: player });
    });

    socket.on('NOTIFICATION', (index, notification) => {
      dispatch({ type: 'NOTIFICATION', index: index, notification: notification });
    });

    socket.on('INITIALIZE', (index) => {
      dispatch({ type: 'INITIALIZE', index: index });
    });

    socket.on('START_BATTLE', ({ actionStack, startBoard, winner, countdown }) => {
      dispatch({ type: 'START_BATTLE', actionStack, startBoard, winner, countdown });
    });

    socket.on('END_GAME', (winningPlayer) => {
      dispatch({ type: 'END_GAME', winningPlayer });
      setTimeout(() => {
        window.location.reload();
      }, 60000);
    });

    socket.on('DEAD_PLAYER', (pid, position) => {
      dispatch({ type: 'DEAD_PLAYER', pid, position });
    });

    ws = {
      socket: socket,
      emitMessage
    };
  }

  return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
};
