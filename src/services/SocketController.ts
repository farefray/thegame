import 'reflect-metadata';
import { Container } from 'typedi';
import { EventEmitter } from 'events';
import AppError from '../objects/AppError';

import SessionStore from '../models/SessionsStore';
import GameService from './GameService';
import Player from '../objects/Player';
import State from '../objects/State';
import { BattleResult } from '../objects/Battle';
import Position from '../shared/Position';
import { Socket } from 'socket.io';

// const admin = require('firebase-admin')

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// Dependency container
Container.set('session.store', new SessionStore());

// Event emitter
const eventEmitter: EventEmitter = new EventEmitter();
Container.set('event.emitter', eventEmitter);

const Customer = require('../objects/Customer');

const ConnectedPlayers = require('../models/ConnectedPlayers');

// Init connected players models
const connectedPlayers = new ConnectedPlayers();
console.log("connectedPlayers", connectedPlayers)


eventEmitter.on('roundBattleStarted', (uid, playerBattleResult: BattleResult) => {
  const io: SocketIO.Server = Container.get('socket.io');
  io.to(uid).emit('START_BATTLE', playerBattleResult);
});

eventEmitter.on('stateUpdate', (uid, state: State) => {
  const io: SocketIO.Server = Container.get('socket.io');
  console.log('updating state');
  io.to(uid).emit('UPDATED_STATE', state.toSocket());

  // if we are sending whole state, thats game start or round update.
  // We need to deliver all the changes to our players
  console.log('updating state callback');
  state.syncPlayers();
});

/**
 * ! TODO need to batch those updates and not send instantly (@see gameplay console)
 */
eventEmitter.on('playerUpdate', (uid, player: Player) => {
  const io: SocketIO.Server = Container.get('socket.io');
  io.to(uid).emit('UPDATE_PLAYER', player);
});

const SOCKETROOMS = {
  WAITING: 'WAITING_ROOM'
}

class SocketController {
  private socket;
  private id;

  constructor(socket: Socket) {
    this.socket = socket;
    this.id = socket.id;
    console.log('constructor');

    socket.on('ON_CONNECTION', this.onConnection);
    socket.on('PLAYER_READY', this.playerReady);
    socket.on('START_GAME', this.startGame);
    socket.on('disconnect', this.disconnect);
    socket.on('CUSTOMER_LOGIN', this.login);
    socket.on('NEW_CUSTOMER_REGISTRATION', this.newRegistration)
    socket.on('PURCHASE_UNIT', this.unitPurchase);
    socket.on('PLACE_PIECE', this.placeUnit);
    socket.on('SELL_PIECE', this.sellUnit);
  }

  onConnection = (firebaseUser, cb) => {
    let message = 'Connection established!';
    if (firebaseUser) {
      // upon connection, our user is already authentificated, we can restore his session
      message = 'Connection restored';
    }

    console.log('@onConnection', this.id)
    connectedPlayers.set(this.id, new Customer(this.id));
    console.log("SocketController -> onConnection -> connectedPlayers", connectedPlayers)

    this.socket.emit('NOTIFICATION', {
      type: 'success',
      message
    });
    
    cb({ ok: true })
  }

  login = (firebaseUser, cb) => {
    // ? todo set user.uid to current session
    cb({ ok: true })
  }

  playerReady = (fn) => {
    console.log('Player with socket ID: ' + this.id + ' is ready to start a game');
    this.socket.join(SOCKETROOMS.WAITING); // place new customers to waiting room
    this.socket.emit('IS_READY', true)
    fn('true:)')
  }

  startGame = () => {
    const io: SocketIO.Server = Container.get('socket.io');

    io.in(SOCKETROOMS.WAITING).clients(async (err, clients) => {
      if (err) {
        throw new Error(err);
      }

      // TODO 'Ready' button on lobby, so only clients with ready status are getting game started
      const session = GameService.initGameSession(clients);

      // Update players, to notify them that they are in game and countdown till round start
      const _eventEmitter: EventEmitter = Container.get('event.emitter');
      const state = session.getState();
      console.log('start');
      for (let index = 0; index < clients.length; index++) {
        const socketID = clients[index];
        connectedPlayers.setIn(socketID, ['sessionID', session.ID]); // maybe overkill, especially when a lot of customers. Investigate if we still need this?

        console.log('INITIALIZE');
        const _socket = io.sockets.connected[socketID];
        _socket.emit('INITIALIZE', {}, function (answer) {
          console.log('answer', answer);
        });

        

        _socket.send('INITIALIZE', () => {
          console.log('callback after initialize')
          _socket.leave(SOCKETROOMS.WAITING);
          _socket.join('LOBBY_' + session.ID);
          console.log('sending state to player _socket')
          _socket.emit('UPDATED_STATE', state.toSocket(), () => {
            console.log('callback after updated state')
          });
        })
      }

      console.log('startGameSession');
      GameService.startGameSession(session);
    });
  }

  disconnect = () => {
    console.log('@disconnect', this.id);
    const customer = connectedPlayers.get(this.id);
    // todo peft test, need to make sure no links to this customer left in memory, else garbage collector will not clean this...

    if (customer) {
      const sessionsStore: SessionStore = Container.get('session.store');
      // update rooms
      const sessionID = customer.get('sessionID'); // ? this.id?
      if (sessionID) {
        const session = sessionsStore.get(sessionID);
        session.disconnect(this.id);
        if (session.hasClients()) {
          return; // notify about disconnect todo
        }

        sessionsStore.destroy(sessionID);
      }
    } // todo case when no customer?
  }

  newRegistration = (firebaseUser, cb) => {
    this.socket.emit('NOTIFICATION', {
      type: 'success',
      message: 'Account was successfully created. See you in game!'
    });

    cb({ ok: true })
  };

  unitPurchase = (pieceIndex) => {
    const sessionID = connectedPlayers.getSessionID(this.id);
    const sessionsStore: SessionStore = Container.get('session.store');
    const session = sessionsStore.get(sessionID);
    const state = session.getState();
    const player = state.getPlayer(this.id);
    const result = player.purchasePawn(pieceIndex);
    const io: SocketIO.Server = Container.get('socket.io');
    if (result instanceof AppError) {
      io.to(`${this.id}`).emit('NOTIFICATION', result);
      return;
    }

    // todo check consistency
    // sessionsStore.store(session);
  }

  sellUnit = (fromBoardPosition) => {
    const sessionsStore: SessionStore = Container.get('session.store');
    const sessionID = connectedPlayers.getSessionID(this.id);
    const session = sessionsStore.get(sessionID);
    const state = session.getState();
    const player: Player = state.getPlayer(this.id);
    player.sellPawn(fromBoardPosition);
  }

  placeUnit = (fromBoardPosition, toBoardPosition) => {
    const sessionID = connectedPlayers.getSessionID(this.id);
    const sessionsStore: SessionStore = Container.get('session.store');
    const session = sessionsStore.get(sessionID);
    const state = session.getState();
    const player: Player = state.getPlayer(this.id);
    player.moveUnitBetweenPositions(Position.fromString(fromBoardPosition), Position.fromString(toBoardPosition));

    // ? do we really need this?
    // session.updateState(state);
    // sessionsStore.store(session);
  }
}

export default SocketController;
