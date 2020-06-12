const defaultCustomer = {
  isLoggedIn: false,
  email: ''
};

export default function customer(state = defaultCustomer, action) {
  switch (action.type) {
    /** After emitting event, backend response being dispatched to store */
    case 'CUSTOMER_LOGIN_TRY':
      return state = {
        ...state,
        isLoggedIn: action.response?.success,
        email: action.response?.email
      };
    default:
      return state
  }
}