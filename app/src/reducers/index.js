import { combineReducers } from 'redux';
import { app } from './app.reducer';
import { startscreen } from './startscreen.reducer';

const rootReducer = combineReducers({
  app,
  startscreen
});

export default rootReducer;