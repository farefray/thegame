export function startscreen(
  state = {
    isConnected: false,
    isReady: false
  },
  action
) {
  switch (action.type) {
    case 'SET_CONNECTED': {
      return {
        ...state,
        isConnected: action.isConnected
      };
    }
    case 'SET_READY': {
      return {
        ...state,
        isReady: action.isReady
      };
      }
    default:
      return state;
  }
}
