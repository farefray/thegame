import 'reflect-metadata';
import { Container } from 'typedi';
import { EventEmitter } from 'events';
import AppError from '../objects/AppError';

import SessionStore from '../singletons/SessionsStore';
import GameService from './GameService';
import Player from '../objects/Player';
import State from '../objects/State';
import { BattleResult } from '../objects/Battle';
import Position from '../shared/Position';
import { Socket } from 'socket.io';
import ConnectedPlayers from '../singletons/ConnectedPlayers';
import { SocketID } from '../utils/types';
import { Session } from 'inspector';
import SessionsStore from '../singletons/SessionsStore';
// const admin = require('firebase-admin')

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

const sessionStore = SessionsStore.getInstance();

// Dependency container
// Event emitter
const eventEmitter: EventEmitter = new EventEmitter();
Container.set('event.emitter', eventEmitter);

eventEmitter.on('roundBattleStarted', (uid, playerBattleResult: BattleResult) => {
  const io: SocketIO.Server = Container.get('socket.io');
  io.to(uid).emit('START_BATTLE', playerBattleResult);
});

eventEmitter.on('stateUpdate', (uid, state: State) => {
  const io: SocketIO.Server = Container.get('socket.io');
  io.to(uid).emit('UPDATED_STATE', state.toSocket());

  // if we are sending whole state, thats game start or round update.
  // We need to deliver all the changes to our players
  state.syncPlayers();
});

/**
 * ! TODO need to batch those updates and not send instantly (@see gameplay console)
 */
eventEmitter.on('playerUpdate', (player: Player) => {
  const io: SocketIO.Server = Container.get('socket.io');
  io.to(player.socketID).emit('UPDATE_PLAYER', player.toSocket());
});

const SOCKETROOMS = {
  WAITING: 'WAITING_ROOM'
};

const connectedPlayers = ConnectedPlayers.getInstance();

class SocketService {
  private socket: Socket;
  private id: SocketID;

  constructor(socket: Socket) {
    this.socket = socket;
    this.id = socket.id;

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
      console.log("SocketService -> constructor -> packetDetails", packetDetails)

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
            })
          }
        }
      }

      next();
    });
  }

  ON_CONNECTION = (firebaseUser) => {
    console.log("SocketService -> ON_CONNECTION -> firebaseUser", firebaseUser)
    let message = 'Connection established!';
    if (firebaseUser) {
      // upon connection, our user is already authentificated, we can restore his session
      message = 'Connection restored';

      connectedPlayers.login(firebaseUser, this.id);
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
    connectedPlayers.login(firebaseUser, this.id);
    return true;
  };

  /**
   * TODO:
   * * all ready players are in same room, while we need only 'X' amount into the game?
   * * dispatch waiting lobby to frontend also
   */
  PLAYER_READY = () => {
    console.log('Player with socket ID: ' + this.id + ' is ready to start a game');
    const customer = connectedPlayers.getBySocket(this.id);
    if (customer) {
      this.socket.join(SOCKETROOMS.WAITING);
      // customer.setReady(true);

      const io: SocketIO.Server = Container.get('socket.io');
      io.in(SOCKETROOMS.WAITING).clients(async (err, clients) => {
        if (err) {
          throw new Error(err);
        }

        if (clients.length >= 2) {
          this.startGame(clients);
        }
      });

      return { ready: true};
    }

    return false;
  };

  START_AI_GAME = () => {
    this.startGame([this.id]);
    return true;
  };

  startGame(clients) {
    const io: SocketIO.Server = Container.get('socket.io');

    for (let index = 0; index < clients.length; index++) {
      const socketID = clients[index];
      const _socket = io.sockets.connected[socketID];
      _socket.leave(SOCKETROOMS.WAITING);
    }

    GameService.startGame(clients);
  };

  disconnect = () => {
    console.log('@disconnect', this.id);
    const connectedPlayers = ConnectedPlayers.getInstance();
    const customer = connectedPlayers.disconnect(this.id);

    if (customer) {
      // TODO !!!
      // !!!
      // const sessionsStore: SessionStore = Container.get('session.store');
      // // update rooms
      // const sessionID = customer.get('sessionID'); // ? this.id?
      // if (sessionID) {
      //   const session = sessionsStore.get(sessionID);
      //   session.disconnect(this.id);
      //   if (session.hasClients()) {
      //     return; // notify about disconnect todo
      //   }

      //   sessionsStore.destroy(sessionID);
      // }
    } // todo case when no customer?

    return true;
  };

  NEW_CUSTOMER_REGISTRATION = () => {
    this.socket.emit('NOTIFICATION', {
      type: 'success',
      message: 'Account was successfully created. See you in game!'
    });

    return true;
  };

  PURCHASE_UNIT = (pieceIndex) => {
    const customer = connectedPlayers.getBySocket(this.id);
    if (customer) {
      const session = customer.getSession();

      if (session) {
        // TODO player id should be unique, not socket based! (we will have troubles reconnecting)
        const result = session.getState().getPlayer(this.id)?.purchasePawn(pieceIndex);
        if (result instanceof AppError) {
          const io: SocketIO.Server = Container.get('socket.io');
          io.to(`${this.id}`).emit('NOTIFICATION', result);
          return false;
        }

        return true;
      }
    }

    return false;
  };

  PLACE_PIECE = (positions) => {
    const customer = connectedPlayers.getBySocket(this.id);
    if (customer) {
      const session = customer.getSession();

      if (session) {
        // TODO player id should be unique, not socket based! (we will have troubles reconnecting)
        session.getState().getPlayer(this.id)?.moveUnitBetweenPositions(Position.fromString(positions.from), Position.fromString(positions.to));

        return true;
      }
    }

    return false;
  };

  sellUnit = (fromBoardPosition) => {
    const customer = connectedPlayers.getBySocket(this.id);
    if (customer) {
      const session = customer.getSession();

      if (session) {
        // TODO player id should be unique, not socket based! (we will have troubles reconnecting)
        session.getState().getPlayer(this.id)?.sellPawn(fromBoardPosition);

        return true;
      }
    }

    return false;
  };
}

export default SocketService;
