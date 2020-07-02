import { action, thunk, Action, Thunk } from 'easy-peasy';
import { emitMessage } from '@/socket';

export interface CustomerModel {
  isLoggedIn: boolean;
  isReady: boolean;
  email: string;

  setLoggedIn: Action<CustomerModel, boolean>;
  authenticate: Thunk<CustomerModel, firebase.User | null>;
}

const customerModel: CustomerModel = {
  isLoggedIn: false,
  isReady: false,
  email: '',

  setLoggedIn: action((state, payload) => {
    state.isLoggedIn = payload;
  }),

  authenticate: thunk(async (actions, payload) => {
    emitMessage('CUSTOMER_LOGIN', payload)
      .then((res) => {
        actions.setLoggedIn(true);
      })
      .catch((reason) => {
        actions.setLoggedIn(false);
      });
  })
};

export default customerModel;
