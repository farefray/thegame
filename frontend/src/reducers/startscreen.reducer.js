export function startscreen(
  state = {
    isConnected: false,
    isReady: false
  },
  action
) {
  switch (action.type) {
    case 'ON_CONNECTION': {
      return {
        ...state,
        isConnected: true
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
