import BattleController from './BattleController';
import GameController from './GameController';
import BoardController from './BoardController';
import ShopController from './ShopController';

const Customer = require('../objects/Customer');
const Session = require('../objects/Session');

const ConnectedPlayers = require('../models/ConnectedPlayers');
const SessionsStore = require('../models/SessionsStore');

// Init connected players models\
const connectedPlayers = new ConnectedPlayers();
const sessionsStore = new SessionsStore();

const STARTBATTLE_TIMER = 15000;
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
        email
      });

      return callback(true);
    }

    return callback(false);
  });

  const initializeGameSessions = async (clients) => {
    const state = await GameController.initialize(clients); // deep TODO, mostly for shop and so on
    const session = new Session(clients, state);
    const sessionID = session.get('ID');
    sessionsStore.store(session);
    state.prepareForSending();

    clients.forEach(socketID => {
      connectedPlayers.setIn(socketID, ['sessionID', sessionID]); // maybe overkill, especially when a lot of customers
      io.to(socketID).emit('ADD_PLAYER', socketID); // ??

      // TODO fixme
      socket.join(sessionID, () => {
        const rooms = Object.keys(socket.rooms);
        // console.log(rooms); // [ <socket.id>, 'room 237' ]
        io.to(sessionID).emit('UPDATED_STATE', asNetworkMessage(state));
      });
    });

    // Schedule battle start
    const scheduleNextRound = () =>
      setTimeout(async () => {
        // TODO lock all players actions on BE/FE so they wont interrupt battle? Or need to be checked for active battle for actions which are permitted
        const preBattleSession = sessionsStore.get(sessionID);

        if (!preBattleSession) {
          // no more session exists, f.e. players has disconnected
          // todo maybe remove session from store if exist? state? memory leak?
          return;
        }

        const preBattleState = preBattleSession.get('state');
        await BoardController.preBattleCheck(preBattleState);
        const battleRoundResult = await BattleController.setup(preBattleState);
        clients.forEach(socketID => {
          io.to(`${socketID}`).emit('BATTLE_TIME', battleRoundResult.battles[socketID].actionStack, battleRoundResult.battles[socketID].startBoard, battleRoundResult.battles[socketID].winner);
        });

        // We can actually count battle finish state here already and only schedule update
        /*
          Update state with:
          a - round change, gold reward winners,
          a_2 - refresh shop
          b - damage for losers
          c - update state, endgame maybe, save state to session,
          d - update players
        */

        preBattleState.endRound(); // a
        await ShopController.mutateStateByShopRefreshing(preBattleState); // a_2
        preBattleState.damagePlayers(battleRoundResult.battles); // b

        // Schedule all this to happen after last battle finished on FE
        const EXTRA_TIME = 25000;
        setTimeout(async () => {
          // TODO Future: handle player dead time, to properly assign placing if multiple players are dead
          clients.forEach(socketID => {
            const player = preBattleState.getIn(['players', socketID]);

            if (player.isDead()) {
              const amountOfPlayers = preBattleState.get('amountOfPlayers');
              io.to(socketID).emit('DEAD_PLAYER', socketID, amountOfPlayers + 1);
              preBattleState.dropPlayer(socketID);
            } else {
              io.to(socketID).emit('UPDATED_STATE', asNetworkMessage(preBattleState));
              io.to(socketID).emit('SET_ONGOING_BATTLE', false, STARTBATTLE_TIMER);
            }

            if (preBattleState.get('amountOfPlayers') === 0) {
              // game end
              io.to(socketID).emit('END_GAME', socketID);
            } else {
              sessionsStore.store(preBattleSession);
              scheduleNextRound();
            }
          });
        }, battleRoundResult.battleTime + EXTRA_TIME); // fixme somehow it ends quite faster than game ends on FE. Maybe battleTime is wrong?

        // round ended, next round must be scheduled?
      }, STARTBATTLE_TIMER);

    scheduleNextRound();
  };

  socket.on('START_AI', async () => {
    const clients = [socket.id];
    await initializeGameSessions(clients);
  });

  socket.on('START_GAME', async () => {
    // TODO multiplayer
    io.in('WAITING_ROOM').clients(async (err, clients) => {
      console.log('setting session for waiting room', clients);

      if (err) {
        throw new Error(err);
      }

      await initializeGameSessions(clients);
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

module.exports = SocketController;