import BattleController from './BattleController';
import BoardController from './BoardController';
import ShopController from './ShopController';
import GameController from './GameController';

const Customer = require('../objects/Customer');
const Session = require('../objects/Session');

const ConnectedPlayers = require('../models/ConnectedPlayers');
const SessionsStore = require('../models/SessionsStore');

// Init connected players models\
const connectedPlayers = new ConnectedPlayers();
const sessionsStore = new SessionsStore();

/**
 * @description Prepares object to be sent with socket in order to not pass additional function and proto stuff
 * @todo better way for this or at least test this performance. Imho there shouldnt be any circular references at all.
 * @param {Object} object
 * @returns {Object}
 */
function asNetworkMessage(object) {
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    console.log('asNetworkMessage critical error: ', e.message);
    console.log(object);
    return '';
  }
}

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
 * @instance
 * @returns {SocketController}
 */
function SocketController(socket, io) {
  this.onConnection = () => {
    socket.join('WAITING_ROOM'); // place new customers to waiting room
  };

  this.io = io;
  this.socket = socket;

  socket.on('ON_CONNECTION', async () => {
    console.log('@ON_CONNECTION', socket.id);
    connectedPlayers.set(socket.id, new Customer(socket.id));
    // TODO: Handle many connected players (thats old comment, I'm not sure what does it means)
  });

  socket.on('disconnect', () => {
    console.log('@disconnect', socket.id);
    const customer = connectedPlayers.get(socket.id);
    if (customer) {
      // todo peft test, need to make sure no links to this customer left in memory, else garbage collector will not clean this...
      connectedPlayers.disconnect(socket.id);
    } else {
      // Important @TODO, make handle for case when no customer(Cannot read properpty 'get' of null)
    }

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

  socket.on('START_AI', async () => {
    const clients = [socket.id];
    await this.initializeGameSessions(clients);
  });

  socket.on('START_GAME', async () => {
    // TODO multiplayer
    io.in('WAITING_ROOM').clients(async (err, clients) => {
      console.log('setting session for waiting room', clients);

      if (err) {
        throw new Error(err);
      }

      await this.initializeGameSessions(clients);
    });
  });

  socket.on('PURCHASE_UNIT', async pieceIndex => {
    // @TODO socket.id is available here is our player index. Need more knowledge about this(if this being unique and stable?)
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const state = await GameController.purchasePawn(session.get('state'), socket.id, pieceIndex);
    if (state) {
      session.set('state', state);
      sessionsStore.store(session);

      // todo some abstract sending with try catch, to not crash app every time it bugs :)
      const playerState = state.getIn(['players', socket.id]);
      io.to(`${socket.id}`).emit('UPDATE_PLAYER', socket.id, asNetworkMessage(playerState));
    }
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
    io.to(`${socket.id}`).emit('UPDATE_PLAYER', socket.id, asNetworkMessage(playerState));
  });

  socket.on('SELL_PIECE', async (fromBoardPosition) => {
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const state = session.get('state');
    await BoardController.mutateStateByPawnSelling(state, socket.id, fromBoardPosition);
    const playerState = state.getIn(['players', socket.id]);
    io.to(`${socket.id}`).emit('UPDATE_PLAYER', socket.id, asNetworkMessage(playerState));
  });

  return this;
}

SocketController.prototype.initializeGameSessions = async function (clients) {
  const state = await GameController.initialize(clients);
  const session = new Session(clients, state);
  const sessionID = session.get('ID');
  sessionsStore.store(session);

  // Update players, to notify them that they are in game and countdown till round start
  clients.forEach(socketID => {
    connectedPlayers.setIn(socketID, ['sessionID', sessionID]); // maybe overkill, especially when a lot of customers
    this.io.to(socketID).emit('INITIALIZE', socketID);
    console.log('Initializing player: ', socketID);

    // TODO
    this.socket.join(sessionID, () => {
      const rooms = Object.keys(this.socket.rooms);
      console.log(rooms); // [ <socket.id>, 'room 237' ]
      this.io.to(sessionID).emit('UPDATED_STATE', asNetworkMessage(state)); // todo get rid of asNetwork
    });
  });

  this.round(state, clients, sessionID);
};

/**
 * @todo this maybe should be moved to gamecontroller
 */
SocketController.prototype.round = async function (state, clients, sessionID) {
  // start round when its time
  await state.scheduleRoundStart();

  // do we need to update our session from storage?? TODO Test
  const preBattleSession = sessionsStore.get(sessionID); // TODO WE GOT NULL HERE SOMEWHERE (!!URGENT)
  const preBattleState = preBattleSession.get('state');
  await BoardController.preBattleCheck(preBattleState);
  const battleRoundResult = await BattleController.setup(preBattleState);
  clients.forEach(socketID => {
    const {
      actionStack,
      startBoard,
      winner
    } = battleRoundResult.battles[socketID];

    this.io.to(`${socketID}`).emit('START_BATTLE', actionStack, startBoard, winner);
  });

  await state.scheduleRoundEnd(battleRoundResult);
  ShopController.mutateStateByShopRefreshing(state);
  this.io.to(sessionID).emit('UPDATED_STATE', asNetworkMessage(state));

  await state.scheduleNextRound();
  this.round(state, clients, sessionID);
};

export default SocketController;