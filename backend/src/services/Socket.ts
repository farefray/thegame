import 'reflect-metadata';
import { Container } from 'typedi';
import AppError from '../typings/AppError';

import EventBus from '../services/EventBus';
import { Socket } from 'socket.io';
import ConnectedPlayers from './ConnectedPlayers';
import { SocketID } from '../utils/types';
import Customer from '../models/Customer';
import Game from '../models/Game';
// const admin = require('firebase-admin')

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

const SOCKETROOMS = {
  WAITING: 'WAITING_ROOM'
};

const connectedPlayers = ConnectedPlayers.getInstance();

const eventBus = new EventBus();
Container.set('event.bus', eventBus);

const PLAYERS_REQUIRED = 2;
// todo check case when user is starting new game while he has one already
class SocketService {
  private socket: Socket;
  private id: SocketID;

  constructor(socket: Socket) {
    this.socket = socket;
    this.id = socket.id;

    console.log('constructor, game is null')

    /**
     * Magical handler for all frontend events. This may be wrong concept, need to be revised.
     * * Event handlers description
     * Every event supposed to have callback function, which later will be dispatched on storefront as handled event response
     * Example:
     * Frontend login >
     * firebase auth >
     * socket emiting event to backend >
     * backend retrieves event and executes handler >
     * after handler executes callback if exists >
     * if callback was executed, frontend dispatch into redux store to update frontend app state.
     */
    socket.use((packet, next) => {
      const [...packetDetails] = packet;

      if (packetDetails.length >= 2) {
        // thats the correct package, got event name and at least param/callback
        const handlerName = (packetDetails.shift() + '').toUpperCase(); // first param is always event name

        if (handlerName && this.hasOwnProperty(handlerName.toUpperCase())) {
          const handleResult = this[handlerName](...packetDetails);

          const callback = packetDetails.pop();
          if (callback && typeof callback === 'function') {
            callback({
              ok: !!handleResult,
              ...handleResult
            });
          }
        }
      }

      next();
    });
  }

  disconnect = () => {
    console.log('@disconnect', this.id);
    const connectedPlayers = ConnectedPlayers.getInstance();
    const customer = connectedPlayers.disconnect(this.id);

    if (customer) {
      // TODO !!!
      // !!!
      // const SessionsService: SessionStore = Container.get('session.store');
      // // update rooms
      // const sessionID = customer.get('sessionID'); // ? this.id?
      // if (sessionID) {
      //   const session = SessionsService.get(sessionID);
      //   session.disconnect(this.id);
      //   if (session.hasClients()) {
      //     return; // notify about disconnect todo
      //   }
      //   SessionsService.destroy(sessionID);
      // }
    } // todo case when no customer?

    return true;
  };

  ON_CONNECTION = (firebaseUser) => {
    let message = 'Connection established!';
    if (firebaseUser) {
      // upon connection, our user is already authentificated, we can restore his session
      message = 'Connection restored';

      this.CUSTOMER_LOGIN(firebaseUser);
    }

    this.socket.emit('NOTIFICATION', {
      type: 'success',
      message
    });

    return {
      user: firebaseUser && firebaseUser.uid
    };
  };

  CUSTOMER_LOGIN = (firebaseUser) => {
    if (!firebaseUser) {
      // no user exists on firebase onAuthChanged or thats a logout
      return;
    }

    const loginResults = connectedPlayers.login(firebaseUser, this.id);
    if (loginResults && loginResults.session) {
      // restore player session
      const { customer, session } = loginResults;
      session.getState().getPlayer(customer.ID)?.invalidate(); // mark player as 'update needed'

      // todo state has to be corrected, so player timer will show proper timing + player actions will be blocked on frontend
      // const eventBus:EventBus = Container.get('event.bus');
      // eventBus.emit('stateUpdate', customer.ID, session.getState()); // todo

      // todo restore if he is in battle?
    }

    return true;
  };

  CUSTOMER_LOGOUT = () => {
    return true;
  };

  /** Methods which are responsible for socket events handling. Function name = Event name */
  PLAYER_READY = () => {
    /**
     * TODO:
     * * all ready players are in same room, while we need only 'X' amount into the game?
     * * dispatch waiting lobby to frontend also
     */
    const customer = connectedPlayers.getBySocket(this.id);
    if (customer) {
      this.socket.join(SOCKETROOMS.WAITING);
      // customer.setReady(true);

      const io: SocketIO.Server = Container.get('socket.io');
      io.in(SOCKETROOMS.WAITING).clients(async (err, clients) => {
        if (err) {
          throw new Error(err);
        }

        if (clients.length >= PLAYERS_REQUIRED) {
          const io: SocketIO.Server = Container.get('socket.io');
          for (let index = 0; index < PLAYERS_REQUIRED; index++) {
            const socketID = clients[index];
            const _socket = io.sockets.connected[socketID];
            _socket.leave(SOCKETROOMS.WAITING);
          }

          const customers = clients.reduce((customers: Customer[], socketID) => {
            const customer = connectedPlayers.getBySocket(socketID);
            if (customer) {
              customers.push(customer);
            }

            return customers;
          }, []);

          // tslint:disable-next-line: no-unused-expression
          new Game(customers[0], customers[1]);
          return true;
        }
      });

      return { ready: true };
    }

    return false;
  };

  START_AI_GAME = () => {
    const customer = connectedPlayers.getBySocket(this.id);
    if (!customer) {
      return false;
    }

    // tslint:disable-next-line: no-unused-expression
    new Game(customer);
    return true;
  };

  /**
   * Since registration is handled on frontend, we just send notification to backend that event successfully handled
   */
  NEW_CUSTOMER_REGISTRATION = () => {
    this.socket.emit('NOTIFICATION', {
      type: 'success',
      message: 'Account was successfully created. See you in game!'
    });

    return true;
  };

  PURCHASE_CARD = (cardIndex) => {
    const customer = connectedPlayers.getBySocket(this.id);
    if (customer) {
      return customer.getSession()?.getState()?.purchaseCard(customer.ID, cardIndex);
    }

    return true;
  };
}

export default SocketService;
