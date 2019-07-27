import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
import reducer from './reducer';

export default function(initialState) {
  debugger;
  const store = createStore(reducer, initialState, devToolsEnhancer());
  return store;
}