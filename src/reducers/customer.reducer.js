const defaultCustomer = {
  isLoggedIn: false,
  email: ''
};

export default function customer(state = defaultCustomer, action) {
  switch (action.type) {
    /** After emitting event, backend response being dispatched to store */
    case 'CUSTOMER_LOGIN':
      console.log('action', action);
      return state = {
        ...state,
        isLoggedIn: true,
        email: action.response?.email // todo check if its working. Seems not :)
      };
    case 'ON_CONNECTION': {
        // When connected, user may be already authentificated and session may be restored
        return {
          ...state,
          isLoggedIn: !!action.response?.user
        };
      }
    default:
      return state
  }
}