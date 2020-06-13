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
        email: action.response?.email
      };
    default:
      return state
  }
}