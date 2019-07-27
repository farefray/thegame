import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
import reducer from './src/reducer';

export default function(initialState) {
  const store = createStore(reducer, initialState, devToolsEnhancer());
  return store;
}