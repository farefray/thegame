/**
 * Socket costumer on frontend. Receives all the socket events and sends further for execution.
 * Uses react context to pass socket thru our app, so any component can dispatch events to backend socket
 */
import React, { createContext } from 'react';
import { auth } from '@/firebase';
import { useStoreActions } from './store/hooks';
import socket, { emitMessage } from '@/socket';
import SocketHandler from './SocketHandler';

const WebSocketContext = createContext(null);

export { WebSocketContext };

export default ({ children }) => {
  let ws;

  const storeActions = useStoreActions(actions => actions);
  const socketHandler = new SocketHandler(storeActions);

  console.log('Socket events seems will be initialized now')
  // socket listeners
  socket.on('connect', () => {
    console.log('Socket connected');
    console.log('auth', auth.currentUser);
    emitMessage('ON_CONNECTION', auth.currentUser).then((res: any) => {
      console.log("here ON_CONNECTION", res)
      storeActions.app.setConnected(res.ok);

      if (res.user) {
        storeActions.customer.setLoggedIn(true);
      }
    });
  });

  // TODO
  socket.on('disconnect', () => {
    storeActions.app.setConnected(false)
    window.location.reload();
    console.log('disconnected');
  });

  socket.on('GAME_IS_LIVE', (playerUUID) => socketHandler.handle('GAME_IS_LIVE', playerUUID));

  socket.on('CARD_PLAY', (cardAction) => socketHandler.handle('CARD_PLAY', cardAction));

  socket.on('PLAYER_UPDATE', (player) => socketHandler.handle('PLAYER_UPDATE', player));

  socket.on('MERCHANTRY_UPDATE', (merchantry) => socketHandler.handle('MERCHANTRY_UPDATE', merchantry));

  socket.on('NOTIFICATION', (notification) => socketHandler.handle('NOTIFICATION', notification));

  socket.on('START_BATTLE', (battle) => socketHandler.handle('START_BATTLE', battle));

  socket.on('END_BATTLE', () => socketHandler.handle('END_BATTLE'));

  socket.on('TIMER_UPDATE', (countdown) => socketHandler.handle('TIMER_UPDATE', countdown));

  socket.on('END_GAME', (winningPlayer) => {
    //dispatch({ type: 'END_GAME', winningPlayer });
    setTimeout(() => {
      window.location.reload();
    }, 60000);
  });

  socket.on('DEAD_PLAYER', (pid, position) => {
    //dispatch({ type: 'DEAD_PLAYER', pid, position });
  });

  ws = {
    socket: socket,
    emitMessage
  };

  return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
};
