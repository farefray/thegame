import { combineReducers } from 'redux';
import { app } from './app.reducer';
import { startscreen } from './startscreen.reducer';
import { gameboard } from './gameboard.reducer';
import customer from './customer.reducer';

const rootReducer = combineReducers({
  app,
  gameboard,
  startscreen,
  customer
});

export default rootReducer;
