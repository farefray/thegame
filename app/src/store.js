import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';

import {
  createLogger
} from 'redux-logger';
import rootReducer from './reducers';

const loggerMiddleware = createLogger();

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      loggerMiddleware, 
    ),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export default store;