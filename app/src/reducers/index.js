import { combineReducers } from 'redux';
import { app } from './app.reducer';
import { startscreen } from './startscreen.reducer';
import customer from './customer.reducer';

const rootReducer = combineReducers({
  app,
  startscreen,
  customer
});

export default rootReducer;
