import state from './state.json';
import ActiveGame from '../src/App/ActiveGame';
import '../src/css/grid.css';
import '../src/App.scss';
import '../src/animations.css';

export default {
  component: ActiveGame,
  props: {
    ...state,
    dispatch: (obj) => {
      console.log('dispatching');
      console.log(obj);
    }
  }
};