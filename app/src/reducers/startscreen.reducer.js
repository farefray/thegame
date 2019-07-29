export function startscreen(state = {
  ready: false,
  playersReady: -1,
  playerName: '',
  loadedUnitJson: false,
  connected: false,
  connectedPlayers: 0
}, action) {
  switch (action.type) {
    case 'ALL_READY': {
      return {
        ...state,
        playersReady: action.playersReady,
        connectedPlayers: action.connectedPlayers
      }
    }
    case 'TOGGLE_READY':
      return {
        ...state,
        ready: !state.ready
      }
    case 'UPDATE_PRIVATE_NAME': {
      return {
        ...state,
        playerName: action.name
      }
    }
    case 'LOAD_UNIT_JSON': {
      return {
        ...state,
        unitJson: action.json.mosntersJSON,
        loadedUnitJson: true
      }
    }
    case 'SET_CONNECTED': {
      return {
        ...state,
        connected: action.connected
      }
    }
    case 'READY': {
      return {
        ...state,
        playersReady: action.playersReady,
        connectedPlayers: action.connectedPlayers
      }
    }
    default:
      return state
  }
}