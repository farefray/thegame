const defaultCustomer = {
  isLoggedIn: false,
  email: ''
};
export default function customer(state = defaultCustomer, action) {
  switch (action.type) {
    case 'CUSTOMER_LOGIN_SUCCESS':
      return state = {
        ...state,
        isLoggedIn: true,
        email: action.customer.email
      };
    default:
      return state
  }
}