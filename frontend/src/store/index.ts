import { createStore } from 'easy-peasy';
import storeModel from './model';

import { createLogger } from 'redux-logger'

const logger = createLogger({
  duration: false,
  collapsed: true,
  diff: true
});

const store = createStore(storeModel, {
  devTools: process.env.NODE_ENV !== 'production',
  middleware: [logger]
});

export default store;