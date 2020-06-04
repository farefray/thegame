export function app(
  state = {
    playerIndex: null,
    gameIsLive: false,
    players: [],
    isDead: true,
    round: 1,
    roundType: '',
    notification: null,
    countdown: 0
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
    case 'NOTIFICATION':
      return state = {
        ...state,
        notification: action.notification
    }
    case 'UPDATED_STATE': {
      return {
        ...state,
        players: action.state.players,
        round: action.state.round,
        countdown: Math.ceil(action.state.countdown / 1000.)
      };
    }
    case 'START_BATTLE': {
      return {
        ...state,
        countdown: Math.ceil(action.countdown / 1000)
      };
    }
    case 'INITIALIZE': {
      return {
        ...state,
        gameIsLive: true,
        isDead: false,
        playerIndex: action.index
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
      return {
        ...state,
        gameIsLive: false,
        isDead: true
      };
    }
    default:
      break;
  }
  return state;
}
