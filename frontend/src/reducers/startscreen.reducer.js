export function startscreen(
  state = {
    isConnected: false,
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
    default:
      return state;
  }
}
