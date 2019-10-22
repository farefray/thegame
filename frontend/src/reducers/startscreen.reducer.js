export function startscreen(
  state = {
    isConnected: false
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
    default:
      return state;
  }
}
