import 'reflect-metadata';
import { Container } from 'typedi';
import { EventEmitter } from 'events';
import AppError from '../typings/AppError';

import GameController from '../controllers/Game';
import Player from '../structures/Player';
import State from '../structures/State';
import { BattleResult } from '../structures/Battle';
import Position from '../shared/Position';
import { Socket } from 'socket.io';
import ConnectedPlayers, { FirebaseUser } from './ConnectedPlayers';
import { SocketID } from '../utils/types';
import Customer from '../models/Customer';
// const admin = require('firebase-admin')

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);


const SOCKETROOMS = {
  WAITING: 'WAITING_ROOM'
};

const connectedPlayers = ConnectedPlayers.getInstance();

// Dependency container
// Event emitter
const eventEmitter: EventEmitter = new EventEmitter();
Container.set('event.emitter', eventEmitter);

eventEmitter.on('roundBattleStarted', (uid: FirebaseUser['uid'], playerBattleResult: BattleResult) => {
  const customer = connectedPlayers.getByID(uid);
  if (customer) {
    const io: SocketIO.Server = Container.get('socket.io');
    io.to(customer.getSocketID()).emit('START_BATTLE', playerBattleResult);
  }
});

eventEmitter.on('stateUpdate', (uid: FirebaseUser['uid'], state: State) => {
  const customer = connectedPlayers.getByID(uid);
  if (customer) {
    const io: SocketIO.Server = Container.get('socket.io');
    io.to(customer.getSocketID()).emit('UPDATED_STATE', state.toSocket());
  }

  // if we are sending whole state, thats game start or round update.
  // We need to deliver all the changes to our players
  state.syncPlayers();
});

eventEmitter.on('playerUpdate', (player: Player) => {
  const customer = connectedPlayers.getByID(player.getUID());
  if (customer) {
    const io: SocketIO.Server = Container.get('socket.io');
    io.to(customer.getSocketID()).emit('UPDATE_PLAYER', player.toSocket());
  }
});

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

  /** Private methods used in service */
  private _startGame(clients) {
    const io: SocketIO.Server = Container.get('socket.io');

    for (let index = 0; index < clients.length; index++) {
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

    GameController.startGame(customers);
  };

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
      session.getState().getPlayer(customer.ID).update(false); // mark player as 'update needed'

      // todo state has to be corrected, so player timer will show proper timing + player actions will be blocked on frontend
      eventEmitter.emit('stateUpdate', customer.ID, session.getState());

      // todo restore if he is in battle?
    }

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

        if (clients.length >= 2) {
          this._startGame(clients);
        }
      });

      return { ready: true};
    }

    return false;
  };

  START_AI_GAME = () => {
    this._startGame([this.id]);
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
        const result = session.getState().getPlayer(customer.ID)?.purchasePawn(pieceIndex);
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
        session.getState().getPlayer(customer.ID)?.moveUnitBetweenPositions(Position.fromString(positions.from), Position.fromString(positions.to));

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
        session.getState().getPlayer(customer.ID)?.sellPawn(fromBoardPosition);

        return true;
      }
    }

    return false;
  };
}

export default SocketService;
