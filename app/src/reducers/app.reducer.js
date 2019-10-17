export function app(
  state = {
    gameIsLive: false,
    index: -1,
    players: {},
    shopUnits: {},
    level: -1,
    exp: -1,
    expToReach: -1,
    gold: -1,
    enemyIndex: -1,
    roundType: '',
    winner: false,
    dmgBoard: {},
    stats: {},
    statsMap: {},
    typeStatsString: '',
    typeBonusString: '',
    round: 1,
    isDead: true,
    selectedShopUnit: '',
    isSelectModeShop: false,
    deadPlayers: [],
    unitJson: {},
    battleStartBoards: {},
    dmgBoards: {},
    dmgBoardTotalDmg: -1,
    markedBuff: '',
    displayMarkedBuff: false,
    prevDmgBoard: {}
  },
  action
) {
  switch (action.type) {
    case 'INIT': {
      // Used for cosmos fixtures
      state.isDead = false;
      state.countdown = 15;
      return {
        ...state
      };
    }
    case 'DEBUG': {
      // Used for cosmos debugging
      console.log(action);
      return {
        ...action.newState.app
      };
    }
    case 'UPDATED_STATE':
      // Update state with incoming data from server
      state = {
        ...state,
        players: action.newState.players,
        round: action.newState.round,
        countdown: 10
      };

      // revise players array here
      if (action.newState.players[state.index]) {
        state = {
          ...state,
          shopUnits: action.newState.players[state.index].shopUnits,
          level: action.newState.players[state.index].level,
          exp: action.newState.players[state.index].exp,
          expToReach: action.newState.players[state.index].expToReach,
          gold: action.newState.players[state.index].gold
        };
      }
      break;
    case 'ADD_PLAYER': {
      return {
        ...state,
        index: action.index,
        gameIsLive: true,
        enemyIndex: -1,
        winner: false,
        dmgBoard: {},
        isDead: false,
        deadPlayers: []
      };
    }
    case 'SET_ONGOING_BATTLE': {
      return {
        ...state,
        countdown: action.countdown
      };
    }
    case 'UPDATE_PLAYER':
      state = {
        ...state,
        shopUnits: action.player.shopUnits,
        level: action.player.level,
        exp: action.player.exp,
        expToReach: action.player.expToReach,
        gold: action.player.gold
      };

      // todo revise players. Do I need state for all players?
      const players = state.players;
      players[action.index] = action.player;
      state = {
        ...state,
        players: {
          ...players
        }
      };
      break;
    case 'END_GAME': {
      console.log('Remaining keys in players ...', Object.keys(state.players));
      Object.keys(state.players).forEach(key => {
        if (key !== action.winningPlayer) {
          console.log('Deleting key ...', key, state.players);
          delete state.players[key];
        }
      });
      state = {
        ...state,
        gameEnded: action.winningPlayer
      };
      break;
    }
    case 'DEAD_PLAYER': {
      if (action.pid === state.index) {
        state = {
          ...state,
          isDead: true
        };
      }
      console.log('Before: Removing player ' + action.pid, state.players);
      const players = state.players;
      const deadPlayer = {
        index: action.pid,
        hp: 0,
        pos: state.position,
        name: players[action.pid].name
      };
      delete players[action.pid];
      console.log('Removing player ' + action.pid, players, state.players);
      const deadPlayers = state.deadPlayers;
      deadPlayers.push(deadPlayer);
      state = {
        ...state,
        deadPlayers,
        players
      };
      console.log('reducer.Dead_player', state.deadPlayers, deadPlayers);
      break;
    }
    default:
      break;
  }
  return state;
}
