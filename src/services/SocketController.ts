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

// Dependency container
Container.set('session.store', new SessionStore());

// Event emitter
const eventEmitter:EventEmitter = new EventEmitter();
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
  const io:SocketIO.Server = Container.get('socket.io');
  io.to(uid).emit('START_BATTLE', playerBattleResult);
});

eventEmitter.on('stateUpdate', (sessionID, state: State) => {
  const io:SocketIO.Server = Container.get('socket.io');
  io.to(sessionID).emit('UPDATED_STATE', state.toSocket()); // do we need to send whole state?
});

/**
 * ! TODO need to batch those updates and not send instantly (@see gameplay console)
 */
eventEmitter.on('playerUpdate', (uid, player: Player) => {
  const io:SocketIO.Server = Container.get('socket.io');
  io.to(uid).emit('UPDATE_PLAYER', player);
})

function SocketController(socket) {
  const gameService = GameService();
  const sessionsStore:SessionStore = Container.get('session.store');
  const io:SocketIO.Server = Container.get('socket.io');

  socket.on('ON_CONNECTION', async () => {
    socket.join('WAITING_ROOM'); // place new customers to waiting room
    connectedPlayers.set(socket.id, new Customer(socket.id));
    // TODO: Handle many connected players (thats old comment, I'm not sure what does it means)
  });

  socket.on('disconnect', () => {
    console.log('@disconnect', socket.id);
    const customer = connectedPlayers.get(socket.id);
    // todo peft test, need to make sure no links to this customer left in memory, else garbage collector will not clean this...

    if (customer) {
      // update rooms
      const sessionID = customer.get('sessionID');
      if (sessionID) {
        const session = sessionsStore.get(sessionID);
        session.disconnect(socket.id);
        if (session.hasClients()) {
          return; // notify about disconnect todo
        }

        sessionsStore.destroy(sessionID);
      }
    } // todo case when no customer?
  });

  socket.on('CUSTOMER_LOGIN_TRY', async (customerData, callback) => {
    const {
      email,
      password,
    } = customerData;
    // TODO auth, check email/pasw for current user, load him from database.
    // false@gmail.com is used to test failed login
    if (email && password && email !== 'false@gmail.com') {
      connectedPlayers.setIn(socket.id, ['isLoggedIn', true]);
      io.to(socket.id).emit('CUSTOMER_LOGIN_SUCCESS', {
        email,
        index: socket.id,
      });

      return callback(true);
    }

    return callback(false);
  });

  socket.on('START_GAME', async () => {
    io.in('WAITING_ROOM').clients(async (err, clients) => {
      if (err) {
        throw new Error(err);
      }

      // creating session
      const session = gameService.initGameSession(clients);
      // Update players, to notify them that they are in game and countdown till round start
      clients.forEach((socketID) => {
        connectedPlayers.setIn(socketID, ['sessionID', session.ID]); // maybe overkill, especially when a lot of customers. Investigate if we still need this?

        io.to(socketID).emit('INITIALIZE', socketID);

        // TODO
        socket.join(session.ID, () => {
          const rooms = Object.keys(socket.rooms);
          console.log(rooms); // [ <socket.id>, 'room 237' ]
          io.to(session.ID).emit('UPDATED_STATE', session.getState().toSocket()); // sending whole state isnt good?
        });
      });

      gameService.startGameSession(session);
    });
  });

  socket.on('PURCHASE_UNIT', async (pieceIndex) => {
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const state = session.getState();
    const player = state.getPlayer(socket.id);
    const result = player.purchasePawn(pieceIndex);
    if (result instanceof AppError) {
      io.to(`${socket.id}`).emit('NOTIFICATION', socket.id, result);
      return;
    }

    // todo check consistency
    // sessionsStore.store(session);
  });

  socket.on('PLACE_PIECE', async (fromBoardPosition, toBoardPosition) => {
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const state = session.getState();
    const player:Player = state.getPlayer(socket.id);
    player.moveUnitBetweenPositions(Position.fromString(fromBoardPosition), Position.fromString(toBoardPosition));

    // ? do we really need this?
    // session.updateState(state);
    // sessionsStore.store(session);
  });

  socket.on('SELL_PIECE', async (fromBoardPosition) => {
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const state = session.getState();
    const player:Player = state.getPlayer(socket.id);
    player.sellPawn(fromBoardPosition);
  });
}


export default SocketController;
