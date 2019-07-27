import state from './state.json';
import AppDebug from '../src/AppDebug';

export default {
  component: AppDebug,
  props: {
    ...state
  },
  reduxState: {
    ...state
  }
};