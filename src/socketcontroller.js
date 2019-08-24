

const { Map, fromJS } = require('immutable');
const Customer = require('./objects/Customer');
const Session = require('./objects/Session');

const GameController = require('./game');
const BattleJS = require('./game/battle.js');
const StateJS = require('./game/state');
const sessionJS = require('./session');
const pawns = require('./pawns');
const abilitiesJS = require('./abilities');
const gameConstantsJS = require('./game_constants');
const f = require('./f');

const ConnectedPlayers = require('./models/ConnectedPlayers');
const SessionsStore = require('./models/SessionsStore');

// Init connected players models\
const connectedPlayers = new ConnectedPlayers();
const sessionsStore = new SessionsStore();

/**
 * @description Prepares object to be sent with socket in order to not pass additional function and proto stuff
 * @todo better way for this or at least test this performance
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

const sessionExist = (socketId) => {
  if (f.isUndefined(connectedPlayers) || f.isUndefined(connectedPlayers.get(socketId))) return false;
  // console.log('If crash: undefined?', connectedPlayers);
  return !f.isUndefined(sessions.get(connectedPlayers.get(socketId).get('sessionId'))); // Crashed here somehow, early
};

const newChatMessage = (socket, io, socketIdParam, senderName, newMessage, type = 'chat') => {
  io.to(socketIdParam).emit('NEW_CHAT_MESSAGE', senderName, newMessage, type);
};


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

  const waitingRoomUpdateStatus = () => {
    const status = connectedPlayers.getWaitingRoomStatus();
    io.to('WAITING_ROOM').emit('WAITINGROOM_STATUS', status);
  };

  socket.on('ON_CONNECTION', async () => {
    console.log('@ON_CONNECTION', socket.id);
    connectedPlayers.set(socket.id, new Customer(socket.id));

    // TODO: Handle many connected players (thats old comment, I'm not sure what does it means)
    // New customer was added, so game is not ready, need to update ready status
    waitingRoomUpdateStatus();
  });

  socket.on('disconnect', () => {
    console.log('@disconnect', socket.id);
    const customer = connectedPlayers.get(socket.id);
    if (customer) {
      // todo peft test, need to make sure no links to this customer left in memory, else garbage collector will not clean this...
      connectedPlayers.disconnect(socket.id);
    }

    // update rooms
    const sessionID = customer.get('sessionID');
    if (sessionID) {
      const session = sessionsStore.get(sessionID);
      session.disconnect(socket.id);
      if (session.hasClients()) {
        return newChatMessage(socket, io, socket.id, 'Player disconnected - ', `${session.clients.length} still connected`, 'disconnect');
      }

      return sessionsStore.destroy(sessionID);
    }

    return waitingRoomUpdateStatus();
  });

  socket.on('READY', () => {
    connectedPlayers.setIn(socket.id, ['isReady', true]);
    waitingRoomUpdateStatus();
  });

  socket.on('UNREADY', () => {
    connectedPlayers.setIn(socket.id, ['isReady', false]);
    waitingRoomUpdateStatus();
  });


  socket.on('START_GAME', async () => {
    // TODO: check if all customers are ready
    io.in('WAITING_ROOM').clients(async (err, clients) => {
      console.log('setting session for waiting room', clients);

      if (err) {
        throw new Error(err);
      }

      const state = await GameController.initialize(clients); // deep TODO, mostly for shop and so on
      const session = new Session(clients, state);
      const sessionID = session.get('ID');
      sessionsStore.store(session);

      console.log('Starting game!');
      state.prepareForSending();

      clients.forEach((socketID) => {
        connectedPlayers.setIn(socketID, ['sessionID', sessionID]); // maybe overkill, especially when a lot of customers
        io.to(socketID).emit('ADD_PLAYER', socketID); // ??
        
        // TODO fixme
        socket.join(sessionID, () => {
          let rooms = Object.keys(socket.rooms);
          console.log(rooms); // [ <socket.id>, 'room 237' ]
          io.to(sessionID).emit('UPDATED_STATE', asNetworkMessage(state));
        });
      });

      const scheduleBattleRound = async () => {
        // TODO lock all players actions on BE/FE so they wont interrupt battle? Or need to be checked for active battle for actions which are permitted
        const preBattleSession = sessionsStore.get(sessionID);
        const battleRoundResult = await BattleJS.battleSetup(preBattleSession.get('state'));
        clients.forEach((socketID) => {
          console.log("TCL: scheduleBattleRound -> socketID", socketID)
          // const playerState = battleRoundResult.getIn(['players', socketID]);
          // io.to(`${socketID}`).emit('UPDATE_PLAYER', socketID, asNetworkMessage(playerState));

          console.log(battleRoundResult.actionStack);
          console.log(battleRoundResult.actionStack[socketID]);
          io.to(`${socketID}`).emit('BATTLE_TIME', battleRoundResult.actionStack[socketID], battleRoundResult.startBoard[socketID], battleRoundResult.winner[socketID]);
        });

        /* TODO
        const longestBattleTime = await sessionJS.getLongestBattleTime(actionStack);
        const longestTime = TIME_FACTOR * longestBattleTime + 3500;
        if (longestTime !== 3000) console.log('sc.LongestTime:', longestTime, longestBattleTime, TIME_FACTOR);
        setTimeout(async () => {
          // After all battles are over
          f.p('Time to End Battle');
          if (!sessionExist(socket.id)) return;
          const stateAfterBattle = sessionJS.buildStateAfterBattle(socket.id, connectedPlayers, sessions, newState);
          // Endbattle and get endTurned state

          const stateCheckDead = await StateJS.endBattleForAll(stateAfterBattle, winners, finalBoards, matchups, roundType);

          let stateEndedTurn = stateCheckDead;
          const iter2 = stateCheckDead.get('players').keys();
          temp = iter2.next();
          // TODO: player.get(dead) gets time of death (last actionStack move)
          // Add all dead players to temp list, remove in order
          // Handle if only one player left (amount===1 below) within this directly
          let endTimesMap = Map({});
          while (!temp.done) {
            const pid = temp.value;
            const player = stateEndedTurn.getIn(['players', pid]);
            if (player.get('dead')) {
              console.log('Dead Player!', pid);
              const endTime = battleEndTimes.get(pid) || 0;
              let tempEndTime = endTime;
              while (endTimesMap.get(tempEndTime)) {
                console.log('Increase endTime by 1 since interference'); // Do something more fair, doesnt matter
                tempEndTime += 1;
              }
              endTimesMap = endTimesMap.set(tempEndTime, pid);
            }
            temp = iter2.next();
          }
          const sortedByEndTimes = Array.from(endTimesMap.keys());
          sortedByEndTimes.sort((a, b) => endTimesMap.get(b) - endTimesMap.get(a));
          let gameEnded = false;
          for (let i = 0; i < sortedByEndTimes.length; i++) {
            const timeOfDeath = sortedByEndTimes[i];
            const pid = endTimesMap.get(timeOfDeath);
            // Now players can get eliminated in order
            if (stateEndedTurn.get('amountOfPlayers') === 1) { // Last players eliminated same round
              console.log('ENDING GAME!');
              gameEnded = true;
              sessions = sessionJS.updateSessionPieces(socket.id, connectedPlayers, sessions, stateEndedTurn);
              sessions = sessionJS.updateSessionPlayers(socket.id, connectedPlayers, sessions, stateEndedTurn);
              const winningPlayer = stateEndedTurn.get('players').values().next().value;
              emitMessage(socket, io, sessionId, (socketId) => {
                io.to(socketId).emit('END_GAME', winningPlayer);
              });
            } else { // Player eliminated but game is not over
              console.log('Death:', pid);
              stateEndedTurn = await GameController.removeDeadPlayer(stateEndedTurn, pid);
              const playerName = sessionJS.getPlayerNameSession(session, pid);
              const amountOfPlayers = stateEndedTurn.get('amountOfPlayers');
              newChatMessage(socket, io, socket.id, `${playerName} Eliminated - `, `Alive players: ${amountOfPlayers}`, 'playerEliminated');
              emitMessage(socket, io, sessionId, (socketId) => {
                io.to(socketId).emit('DEAD_PLAYER', pid, amountOfPlayers + 1);
              });
            }
          }

          if (!gameEnded) { // Game wasn't ended in prev stage
            if (stateEndedTurn.get('amountOfPlayers') === 1) { // No solo play allowed
              console.log('ENDING GAME!');
              sessions = sessionJS.updateSessionPieces(socket.id, connectedPlayers, sessions, stateEndedTurn);
              sessions = sessionJS.updateSessionPlayers(socket.id, connectedPlayers, sessions, stateEndedTurn);
              const winningPlayer = stateEndedTurn.get('players').values().next().value;
              emitMessage(socket, io, sessionId, (socketId) => {
                io.to(socketId).emit('END_GAME', winningPlayer);
              });
            } else {
              sessions = sessionJS.updateSessionPieces(socket.id, connectedPlayers, sessions, stateEndedTurn);
              sessions = sessionJS.updateSessionPlayers(socket.id, connectedPlayers, sessions, stateEndedTurn);
              stateEndedTurn.prepareForSending();
              const round = stateToSend.get('round');
              const upcomingRoundType = gameConstantsJS.getRoundType(round);
              const upcomingGymLeader = gameConstantsJS.getGymLeader(round);
              emitMessage(socket, io, sessionId, (socketId) => {
                if (f.isUndefined(upcomingGymLeader)) {
                  io.to(socketId).emit('END_BATTLE', upcomingRoundType);
                } else {
                  io.to(socketId).emit('END_BATTLE', upcomingRoundType, upcomingGymLeader);
                }
                io.to(socketId).emit('UPDATED_STATE', stateToSend);
              });
            }
          }
        }, longestTime);
        */
      };

      setTimeout(() => {
        scheduleBattleRound();
      }, 15000); // TODO better way
    });
  });

  socket.on('BUY_UNIT', async (pieceIndex) => {
    // TODO socket.id is available here is our player index. Need more knowledge about this(if this being unique and stable)
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

  socket.on('PLACE_PIECE', async (fromPosition, toPosition) => {
    const sessionID = connectedPlayers.getSessionID(socket.id);
    const session = sessionsStore.get(sessionID);
    const state = session.get('state');
    const result = await GameController.mutateStateByPawnPlacing(state, socket.id, fromPosition, toPosition);
    const evolutionDisplayName = result['upgradeOccured'];
    //  console.log('@PlacePieceSocket', evolutionDisplayName);
    if (evolutionDisplayName) {
      for (let i = 0; i < evolutionDisplayName.size; i++) {
        const playerName = session.getPlayerName(socket.id);
        newChatMessage(socket, io, socket.id, `${playerName} -> `, evolutionDisplayName.get(i), 'pieceUpgrade');
      }
    }
    console.log('Place piece from', fromPosition, 'at', toPosition, '(evolution =', `${evolutionDisplayName})`);
    session.set('state', state);
    sessionsStore.store(session);
    // todo some abstract sending with try catch, to not crash app every time it bugs :)
    const playerState = state.getIn(['players', socket.id]);
    io.to(`${socket.id}`).emit('UPDATE_PLAYER', socket.id, asNetworkMessage(playerState));
  });

  //////////// OLD STUFF \/

  socket.on('TOGGLE_LOCK', async (stateParam) => {
    // const state = await GameController.toggleLock(fromJS(stateParam), index);
    const prevLock = (fromJS(stateParam)).getIn(['players', socket.id, 'locked']);
    console.log('Toggling Lock for Shop! prev lock =', prevLock);
    socket.emit('LOCK_TOGGLED', socket.id, !prevLock);
    const state = await GameController.toggleLock((fromJS(stateParam)), socket.id);
    sessions = sessionJS.updateSessionPlayer(socket.id, connectedPlayers, sessions, state, socket.id);
  });

  socket.on('BUY_EXP', async (stateParam) => {
    const index = getPlayerIndex(socket.id);
    const stateWithPieces = sessionJS.addPiecesToState(socket.id, connectedPlayers, sessions, fromJS(stateParam));
    const state = await GameController.buyExp(stateWithPieces, index);
    // Gold, shop, hand
    console.log('Bought exp, Player', index);
    sessions = sessionJS.updateSessionPlayer(socket.id, connectedPlayers, sessions, state, index);
    emitMessage(socket, io, getSessionId(socket.id), (socketId) => {
      io.to(socketId).emit('UPDATE_PLAYER', index, state.getIn(['players', index]));
    });
  });

  socket.on('REFRESH_SHOP', async (stateParam) => {
    const index = getPlayerIndex(socket.id);
    const stateWithPieces = sessionJS.addPiecesToState(socket.id, connectedPlayers, sessions, fromJS(stateParam));
    const state = await GameController.refreshShopGlobal(stateWithPieces, index);
    console.log('Refreshes Shop, level', state.getIn(['players', index, 'level']), 'Player', index);
    // Requires Shop and Pieces
    // socket.emit('UPDATED_PIECES', state);
    sessions = sessionJS.updateSessionPlayer(socket.id, connectedPlayers, sessions, state, index);
    sessions = sessionJS.updateSessionPieces(socket.id, connectedPlayers, sessions, state);
    emitMessage(socket, io, getSessionId(socket.id), (socketId) => {
      io.to(socketId).emit('UPDATE_PLAYER', index, state.getIn(['players', index]));
    });
  });

  

  socket.on('WITHDRAW_PIECE', async (stateParam, from) => {
    const index = getPlayerIndex(socket.id);
    const stateWithPieces = sessionJS.addPiecesToState(socket.id, connectedPlayers, sessions, fromJS(stateParam));
    const state = await GameController.withdrawPieceGlobal(stateWithPieces, index, from);
    console.log('Withdraw piece at ', from);
    // Hand and board
    emitMessage(socket, io, getSessionId(socket.id), (socketId) => {
      io.to(socketId).emit('UPDATE_PLAYER', index, state.getIn(['players', index]));
    });
  });

  socket.on('SELL_PIECE', async (stateParam, from) => {
    const index = getPlayerIndex(socket.id);
    const stateWithPieces = sessionJS.addPiecesToState(socket.id, connectedPlayers, sessions, fromJS(stateParam));
    const state = await GameController.sellPieceGlobal(stateWithPieces, index, from);
    console.log('Sell piece at ', from);
    sessions = sessionJS.updateSessionPlayer(socket.id, connectedPlayers, sessions, state, index);
    sessions = sessionJS.updateSessionPieces(socket.id, connectedPlayers, sessions, state);
    // Hand and board
    emitMessage(socket, io, getSessionId(socket.id), (socketId) => {
      io.to(socketId).emit('UPDATE_PLAYER', index, state.getIn(['players', index]));
    });
  });

  socket.on('SEND_MESSAGE', async (message) => {
    // TODO: Login: Player name here instead
    const playerName = sessionJS.getPlayerName(socket.id, connectedPlayers, sessions);
    newChatMessage(socket, io, socket.id, `${playerName}: `, message);
  });

  socket.on('GET_STATS', async (name) => {
    const stats = pawns.getStats(name);
    const ability = await abilitiesJS.getAbility(name);
    let newStats = (await stats).set('abilityType', ability.get('type'));
    if (ability.get('displayName')) {
      newStats = newStats.set('abilityDisplayName', ability.get('displayName'));
    }
    if (typeof newStats.get('evolves_to') === 'string') { // && !Array.isArray(newStats.get('evolves_to').toJS())) { // Test
      const evolStats = await pawns.getStats(newStats.get('evolves_to'));
      newStats = newStats.set('snd_evolves_to', evolStats.get('evolves_to'));
    }
    f.p('Retrieving stats for', name); // , newStats);
    socket.emit('SET_STATS', name, newStats);
  });

  return this;
}

module.exports = SocketController;
