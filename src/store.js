import { createStore, applyMiddleware } from 'redux';

import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import { createLogger } from 'redux-logger';
import rootReducer from './reducers';

const loggerMiddleware = createLogger({
  /* https://github.com/evgenyrodionov/redux-logger */
  collapsed: true,
  diff: true
});

const store = createStore(
  rootReducer,
  composeWithDevTools(
    /* logger must be the last middleware in chain to log actions */
    applyMiddleware(loggerMiddleware)
  )
);

export default store;
