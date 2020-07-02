import './lib/web-animations.min'; // Web Animations API polyfill - https://github.com/web-animations/web-animations-js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './service-worker'; // todo  do we need service worker at all?
import store from './store';
import { StoreProvider } from 'easy-peasy';
import WebSocketProvider from './socket.context';


// react-helmet use here?
ReactDOM.render(
  <StoreProvider store={store}>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </StoreProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
