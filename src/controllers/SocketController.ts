import BattleController from './BattleController';
import BoardController from './BoardController';
import AppError from '../objects/AppError';

import SessionStore from '../models/SessionsStore';
import GameService from './GameService';

// Dependency container
const Container = require("typedi").Container;
Container.set("session.store", new SessionStore());

const Customer = require('../objects/Customer');

const ConnectedPlayers = require('../models/ConnectedPlayers');

// Init connected players models\
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


function SocketController(socket, io) {
  this.onConnection = () => {
    socket.join('WAITING_ROOM'); // place new customers to waiting room
  };

  this.io = io;
  this.socket = socket;

  Container.set("io", io);

  socket.on('ON_CONNECTION', async () => {
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
        const session = Container.get("session.store").get(sessionID);
        session.disconnect(socket.id);
        if (session.hasClients()) {
          return; // notify about disconnect todo
        }

        Container.get("session.store").destroy(sessionID);
      }
    } // todo case when no customer?
  });

  socket.on('CUSTOMER_LOGIN_TRY', async (customerData, callback) => {
    const {
      email,
      password
    } = customerData;
    // TODO auth, check email/pasw for current user, load him from database.
    // false@gmail.com is used to test failed login
    if (email && password && email !== 'false@gmail.com') {
      connectedPlayers.setIn(socket.id, ['isLoggedIn', true]);
      io.to(socket.id).emit('CUSTOMER_LOGIN_SUCCESS', {
        email,
        index: socket.id
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
      const gameService = GameService(Container);
      const session = gameService.initGameSession(clients);
      // Update players, to notify them that they are in game and countdown till round start
      clients.forEach(socketID => {
        connectedPlayers.setIn(socketID, ['sessionID', session.ID]); // maybe overkill, especially when a lot of customers. Investigate if we still need this?

        this.io.to(socketID).emit('INITIALIZE', socketID);

        // TODO
        this.socket.join(session.ID, () => {
          const rooms = Object.keys(this.socket.rooms);
          // console.log(rooms); // [ <socket.id>, 'room 237' ]
          this.io.to(session.ID).emit('UPDATED_STATE', session.getState()); // sending whole state isnt good?
        });
      });

      gameService.startGameSession(session);
    });
  });

  socket.on('PURCHASE_UNIT', async pieceIndex => {
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const stateResult = await GameController.purchasePawn(session.get('state'), socket.id, pieceIndex);
    if (stateResult instanceof AppError) {
      io.to(`${socket.id}`).emit('NOTIFICATION', socket.id, stateResult);
      return;
    }

    session.set('state', stateResult);
    sessionsStore.store(session);

    // todo some abstract sending with try catch, to not crash app every time it bugs :)
    const playerState = stateResult.getIn(['players', socket.id]);
    io.to(`${socket.id}`).emit('UPDATE_PLAYER', socket.id, playerState);
  });

  socket.on('PLACE_PIECE', async (fromBoardPosition, toBoardPosition) => {
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const state = session.get('state');
    await BoardController.mutateStateByPawnPlacing(state, socket.id, fromBoardPosition, toBoardPosition);
    session.set('state', state);
    sessionsStore.store(session);
    // todo some abstract sending with try catch, to not crash app every time it bugs :)
    const playerState = state.getIn(['players', socket.id]);
    io.to(`${socket.id}`).emit('UPDATE_PLAYER', socket.id, playerState);
  });

  socket.on('SELL_PIECE', async (fromBoardPosition) => {
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const state = session.get('state');
    await BoardController.mutateStateByPawnSelling(state, socket.id, fromBoardPosition);
    const playerState = state.getIn(['players', socket.id]);
    io.to(`${socket.id}`).emit('UPDATE_PLAYER', socket.id, playerState);
  });

  return this;
}


export default SocketController;