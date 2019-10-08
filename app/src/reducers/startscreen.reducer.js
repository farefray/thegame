export function startscreen(
  state = {
    playerName: '',
    loadedUnitJson: false,
    isConnected: false,
    connectedPlayers: 0
  },
  action
) {
  switch (action.type) {
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
