/**
 * Socket costumer on frontend. Receives all the socket events and sends further for execution.
 * Uses react context to pass socket thru our app, so any component can dispatch events to backend socket
 */
import React, { createContext } from 'react';
import { auth } from '@/firebase';
import { useStoreActions } from './store/hooks';
import socket, { emitMessage } from '@/socket';
import SocketHandler from './SocketHandler';
import { messageTypes } from './constants/websockets';

interface IContextProps {
  socket: object;
  emitMessage: Function;
}

const WebSocketContext = createContext({} as IContextProps);

export { WebSocketContext };

export default ({ children }) => {
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

  Object.keys(messageTypes).forEach(type =>
    socket.on(type, payload => socketHandler.handle(type, payload))
  );

  socket.on('END_GAME', (winningPlayer) => {
    //dispatch({ type: 'END_GAME', winningPlayer });
    setTimeout(() => {
      window.location.reload();
    }, 60000);
  });

  socket.on('DEAD_PLAYER', (pid, position) => {
    //dispatch({ type: 'DEAD_PLAYER', pid, position });
  });

  let ws: IContextProps = {
    socket: socket,
    emitMessage
  };

  return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
};
