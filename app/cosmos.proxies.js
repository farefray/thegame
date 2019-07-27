// cosmos.proxies.js
import createReduxProxy from 'react-cosmos-redux-proxy';
import configureStore from './configureStore';

const ReduxProxy = createReduxProxy({
  createStore: state => configureStore(state)
});

export default [
  ReduxProxy
  // ...other proxies
];