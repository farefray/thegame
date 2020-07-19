import React, { createContext } from 'react';
import { auth } from '@/firebase';
import { useStoreActions } from './store/hooks';
import socket, { emitMessage } from '@/socket';

const WebSocketContext = createContext(null);

export { WebSocketContext };

// todo consider using https://github.com/itaylor/redux-socket.io
export default ({ children }) => {
  let ws;

  const storeActions = useStoreActions(actions => actions);

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

  socket.on('GAME_IS_LIVE', (playerUUID) => {
    storeActions.app.setGameLive(true);
    storeActions.player.setUUID(playerUUID);
  });

  socket.on('CARD_PLAY', (cardAction) => {
    console.log('SOCKET PLAY CARD');
    storeActions.player.playCard(cardAction);
  });

  socket.on('UPDATE_PLAYER', (player) => {
    storeActions.player.updatePlayer(player);
  });

  socket.on('MERCHANTRY_UPDATE', (merchantry) => {
    storeActions.merchantry.revealCards(merchantry)
  });

  socket.on('NOTIFICATION', (notification) => {
    storeActions.app.setNotification(notification);
  });

  socket.on('START_BATTLE', ({ actionStack, startBoard }) => {
    storeActions.gameboard.startBattle({
      actionStack, startBoard
    })
  });

  socket.on('END_BATTLE', () => {
    storeActions.gameboard.endBattle();
    storeActions.player.setBoard([]);
  });

  socket.on('TIMER_UPDATE', (countdown) => {
    storeActions.app.setCountdown(0); // to re-init components
    storeActions.app.setCountdown(countdown);
  });

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
