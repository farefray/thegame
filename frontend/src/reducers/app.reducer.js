export function app(
  state = {
    gameIsLive: false,
    index: -1,
    players: {}, // do we need this here??
    isDead: true,
    round: 1,
    roundType: ''
  },
  action
) {
  switch (action.type) {
    case 'CUSTOMER_LOGIN_SUCCESS': {
      return {
        ...state,
        index: action.customer.index
      };
    }
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
        countdown: action.newState.countdown / 1000
      };
      break;
    case 'INITIALIZE': {
      return {
        ...state,
        gameIsLive: true,
        isDead: false
      };
    }
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
      delete players[action.pid];
      break;
    }
    default:
      break;
  }
  return state;
}