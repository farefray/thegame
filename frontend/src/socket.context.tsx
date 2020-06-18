import React, { createContext } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { auth } from '@/firebase';

const WebSocketContext = createContext(null);
const isProduction = process.env.NODE_ENV === 'production';

export { WebSocketContext };

export default ({ children }) => {
  let socket;
  let ws;
  let endpoint = isProduction ? 'https://thegame-backend.herokuapp.com/' : 'http://' + window.location.href.split(':3000')[0].split('http://')[1] + '';

  const dispatch = useDispatch();

  const emitMessage = (type, payload) => {
    return new Promise((resolve) => {

      socket.emit(type, payload, (response) => {
        // on every message response, we execute dispatch to our store for backend callback
        if (response.ok) {
          dispatch({ type: type, response });
          return resolve(response);
        }
      });
    });
  };

  if (!socket) {
    socket = io.connect(endpoint);

    // socket listeners
    socket.on('connect', () => {
      console.log('Socket connected');
      console.log('auth', auth);
      emitMessage('ON_CONNECTION', auth.currentUser);

      // TODO consider if we need auth.onAuthChanged
    });

    // TODO
    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', isConnected: false });
      window.location.reload();
      console.log('disconnected');
    });

    socket.on('UPDATED_STATE', (state) => {
      dispatch({ type: 'UPDATED_STATE', state });
    });

    socket.on('UPDATE_PLAYER', (player) => {
      dispatch({ type: 'UPDATE_PLAYER', player: player });
    });

    socket.on('NOTIFICATION', (notification) => {
      dispatch({ type: 'NOTIFICATION', notification: notification });
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
