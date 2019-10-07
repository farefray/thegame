export function startscreen(
  state = {
    ready: false,
    playersReady: -1,
    playerName: '',
    loadedUnitJson: false,
    isConnected: false,
    connectedPlayers: 0
  },
  action
) {
  switch (action.type) {
    case 'TOGGLE_READY':
      return {
        ...state,
        ready: !state.ready
      };
    case 'LOAD_UNIT_JSON': {
      return {
        ...state,
        unitJson: action.json.mosntersJSON,
        loadedUnitJson: true
      };
    }
    case 'SET_CONNECTED': {
      return {
        ...state,
        isConnected: action.isConnected
      };
    }
    default:
      return state;
  }
}
