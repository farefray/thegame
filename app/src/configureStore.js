import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
import rootReducer from './reducers';

export default function(initialState) {
  debugger;
  const store = createStore(rootReducer, initialState, devToolsEnhancer());
  return store;
}