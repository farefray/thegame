import BattleController from './BattleController';
import BoardController from './BoardController';
import ShopController from './ShopController';
import GameController from './GameController';
import AppError from '../objects/AppError';
import AiPlayer from '../models/AiPlayer';

const Customer = require('../objects/Customer');
const Session = require('../objects/Session');

const ConnectedPlayers = require('../models/ConnectedPlayers');
const SessionsStore = require('../models/SessionsStore');

// Init connected players models\
const connectedPlayers = new ConnectedPlayers();
const sessionsStore = new SessionsStore();

/*
  Example io code
  io.on('connection', function(socket){
      socket.emit('request', ); // emit an event to the socket
      io.emit('broadcast', ); // emit an event to all connected sockets
      socket.on('reply', function(){  }); // listen to the event
      socket.broadcast.emit('UPDATED_PIECES', state); (Didn't work, check)
  });
*/

const ADDITIONAL_ROUND_TIME = 5000;
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
      if (err) {
        throw new Error(err);
      }

      await this.initializeGameSessions(clients);
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

SocketController.prototype.initializeGameSessions = async function (clients) {
  const state = await GameController.initialize(clients);
  const session = new Session(clients, state);
  const sessionID = session.get('ID');
  sessionsStore.store(session);

  // Update players, to notify them that they are in game and countdown till round start
  clients.forEach(socketID => {
    connectedPlayers.setIn(socketID, ['sessionID', sessionID]); // maybe overkill, especially when a lot of customers
    this.io.to(socketID).emit('INITIALIZE', socketID);

    // TODO
    this.socket.join(sessionID, () => {
      const rooms = Object.keys(this.socket.rooms);
      // console.log(rooms); // [ <socket.id>, 'room 237' ]
      this.io.to(sessionID).emit('UPDATED_STATE', state); // todo get rid of asNetwork
    });
  });

  await state.scheduleNextRound();

  this.round(state, clients, sessionID);
};

/**
 * @todo this maybe should be moved to gamecontroller
 */
SocketController.prototype.round = async function (state, clients, sessionID) {
  // do we need to update our session from storage?? TODO Test
  const session = sessionsStore.get(sessionID); // TODO WE GOT NULL HERE SOMETIMES (P1)
  if (!session) {
    // user disconnected and no session exists
    return sessionsStore.destroy(sessionID);
  }

  const preBattleState = session.get('state');

  // Count battles for all players, then send those battles
  let countdown = Number.MIN_VALUE;
  const playersBattleResults = [];
  for (let uid in preBattleState.get('players')) {
    const player = preBattleState.getIn(['players', uid]);
    await player.preBattleCheck();

    const playerBoard = player.get('board');
    // todo update preBattleState?

    // todo update state for players?

    // todo PVP, create pairs
    const Ai = new AiPlayer(preBattleState.round);
    // Check to see if a battle is required
    // Lose when empty, even if enemy no units aswell (tie with no damage taken)

    const battleResult = await BattleController.setupBattle({ boards: [
      {
        owner: uid,
        units: playerBoard
      },
      {
        owner: '',
        units: Ai.battleBoard
      }
    ]});

    if (battleResult.battleTime > countdown) {
      countdown = battleResult.battleTime;
    }

    playersBattleResults[uid] = battleResult;
  }

  countdown += ADDITIONAL_ROUND_TIME;
  for (let uid in preBattleState.get('players')) {
    playersBattleResults[uid].countdown = countdown; // all players have the battle length of the longest battle
    this.io.to(`${uid}`).emit('START_BATTLE', playersBattleResults[uid]);
  }

  await state.roundEnd(playersBattleResults, countdown);

  ShopController.mutateStateByShopRefreshing(state);
  this.io.to(sessionID).emit('UPDATED_STATE', state);

  await state.scheduleNextRound();

  this.round(state, clients, sessionID);
};

export default SocketController;