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
    console.log('constructor');

    /**
     * * Event handlers description
     * Every event supposed to have callback function, which later will be dispatched on storefront as handled event response
     * Example:
     * Frontend login > firebase auth > socket emiting event > backend retrieves event > executes callback after backend part is done > on callback frontend executes dispatch into redux store to update frontend app state.
     * TODO this is unsafe, callback can crash the app if not exists for example
     */
    socket.on('ON_CONNECTION', this.ON_CONNECTION);
    socket.on('PLAYER_READY', this.PLAYER_READY);
    socket.on('START_AI_GAME', this.START_AI_GAME);
    socket.on('disconnect', this.disconnect);
    socket.on('CUSTOMER_LOGIN', this.CUSTOMER_LOGIN);
    socket.on('NEW_CUSTOMER_REGISTRATION', this.NEW_CUSTOMER_REGISTRATION);
    socket.on('PURCHASE_UNIT', this.PURCHASE_UNIT);
    socket.on('PLACE_PIECE', this.PLACE_PIECE);

    // todo
    socket.on('SELL_PIECE', this.sellUnit);
  }

  ON_CONNECTION = (firebaseUser, cb) => {
    let message = 'Connection established!';
    if (firebaseUser) {
      // upon connection, our user is already authentificated, we can restore his session
      message = 'Connection restored';

      connectedPlayers.login(firebaseUser, this.id);

      cb({
        ok: true,
        user: firebaseUser.uid
      });
    }

    this.socket.emit('NOTIFICATION', {
      type: 'success',
      message
    });

    cb({ ok: true });
  };

  CUSTOMER_LOGIN = (firebaseUser, cb) => {
    connectedPlayers.login(firebaseUser, this.id);
    cb({ ok: true });
  };

  /**
   * TODO:
   * * all ready players are in same room, while we need only 'X' amount into the game?
   * * dispatch waiting lobby to frontend also
   */
  PLAYER_READY = (args, cb) => {
    console.log('Player with socket ID: ' + this.id + ' is ready to start a game');
    const customer = connectedPlayers.getBySocket(this.id);
    if (customer) {
      this.socket.join(SOCKETROOMS.WAITING);
      // customer.setReady(true);
      cb({ ok: true, ready: true });

      const io: SocketIO.Server = Container.get('socket.io');
      io.in(SOCKETROOMS.WAITING).clients(async (err, clients) => {
        if (err) {
          throw new Error(err);
        }

        if (clients.length >= 2) {
          this.startGame(clients);
        }
      });

      return;
    }

    cb({ ok: false });
  };

  START_AI_GAME = (args, cb) => {
    this.startGame([this.id]);
    cb({ ok: true });
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
  };

  NEW_CUSTOMER_REGISTRATION = (firebaseUser, cb) => {
    this.socket.emit('NOTIFICATION', {
      type: 'success',
      message: 'Account was successfully created. See you in game!'
    });

    cb({ ok: true });
  };

  PURCHASE_UNIT = (pieceIndex, cb) => {
    // TODO player id should be unique, not socket based! (we will have troubles reconnecting)
    const result = sessionStore.getBySocket(this.id)?.getState().getPlayer(this.id)?.purchasePawn(pieceIndex)
    if (result instanceof AppError) {
      const io: SocketIO.Server = Container.get('socket.io');
      io.to(`${this.id}`).emit('NOTIFICATION', result);
      return cb({ ok: false });
    }

    cb({ ok: true });
  };

  PLACE_PIECE = (positions, cb) => {
    const session = sessionStore.getBySocket(this.id);
    const state = session?.getState();
    const player = state?.getPlayer(this.id);
    player?.moveUnitBetweenPositions(Position.fromString(positions.from), Position.fromString(positions.to));

    cb({ ok: true });
  };

  sellUnit = (fromBoardPosition) => {
    const session = sessionStore.getBySocket(this.id);
    const state = session?.getState();
    const player = state?.getPlayer(this.id);
    player?.sellPawn(fromBoardPosition);
  };
}

export default SocketService;
