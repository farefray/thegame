import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { configureSocket, AjaxGetUnitJson } from './socket';
import store from './store';
import { Provider } from 'react-redux';

//ReactDOM.render(<App />, document.getElementById('root'));

// setup socket connection
export const socket = configureSocket(store.dispatch);
AjaxGetUnitJson(unitJSON => {
  localStorage.setItem('unitJSON', JSON.stringify(unitJSON));
});

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
