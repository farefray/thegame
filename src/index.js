import './lib/web-animations.min'; // Web Animations API polyfill - https://github.com/web-animations/web-animations-js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './service-worker';
import { SocketConnector } from './socketConnector';
import store from './store';
import { Provider } from 'react-redux';

if (process.env.NODE_ENV !== 'production') {
  require('./console.log.tweaks.js');
}

// setup socket connection
SocketConnector.init(store.dispatch);

// react-helmet use here?
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
