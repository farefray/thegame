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

// Dependency container
Container.set('session.store', new SessionStore());

// Event emitter
const eventEmitter: EventEmitter = new EventEmitter();
Container.set('event.emitter', eventEmitter);

const Customer = require('../objects/Customer');

const ConnectedPlayers = require('../models/ConnectedPlayers');

// Init connected players models
const connectedPlayers = new ConnectedPlayers();

/*
  Example io code
  io.on('connection', function(socket){
      socket.emit('request', ); // emit an event to the socket
      io.emit('broadcast', ); // emit an event to all connected sockets
      socket.on('reply', function(){  }); // listen to the event
      socket.broadcast.emit('UPDATED_PIECES', state); (Didn't work, check)
  });
*/

/**
 * TODO ! We need to review what we are sending to socket. Many objects can be simplified with toJson and removing unnessesary big parts
 */
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

class SocketController {
  private socket;
  private id;

  constructor(socket: Socket) {
    this.socket = socket;
    this.id = socket.id;
    console.log('constructor');

    socket.on('ON_CONNECTION', this.onConnection);
    socket.on('START_GAME', this.startGame);
    socket.on('disconnect', this.disconnect);
    socket.on('CUSTOMER_LOGIN_TRY', this.loginAttempt);
    socket.on('PURCHASE_UNIT', this.unitPurchase);
    socket.on('PLACE_PIECE', this.placeUnit);
    socket.on('SELL_PIECE', this.sellUnit);
  }

  onConnection = () => {
    console.log('@onConnection', this.id)
    this.socket.join('WAITING_ROOM'); // place new customers to waiting room
    connectedPlayers.set(this.id, new Customer(this.id));
  }

  startGame = () => {
    const io: SocketIO.Server = Container.get('socket.io');

    io.in('WAITING_ROOM').clients(async (err, clients) => {
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
        io.to(socketID).emit('INITIALIZE', socketID);
        _eventEmitter.emit('stateUpdate', socketID, state);
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

  loginAttempt = (customerData, callback) => {
    const { email, password } = customerData;
    // TODO auth, check email/pasw for current user, load him from database.
    // false@gmail.com is used to test failed login
    if (email && password && email !== 'false@gmail.com') {
      connectedPlayers.setIn(this.id, ['isLoggedIn', true]);
      const io: SocketIO.Server = Container.get('socket.io');

      io.to(this.id).emit('CUSTOMER_LOGIN_SUCCESS', {
        email
      });

      return callback(true);
    }

    return callback(false);
  }

  unitPurchase = (pieceIndex) => {
    const sessionID = connectedPlayers.getSessionID(this.id);
    const sessionsStore: SessionStore = Container.get('session.store');
    const session = sessionsStore.get(sessionID);
    const state = session.getState();
    const player = state.getPlayer(this.id);
    const result = player.purchasePawn(pieceIndex);
    const io: SocketIO.Server = Container.get('socket.io');
    if (result instanceof AppError) {
      io.to(`${this.id}`).emit('NOTIFICATION', this.id, result);
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
