import GameBoard from '../src/App/ActiveGame/GameBoard';
import state from './state.json';
import '../src/css/grid.css';
import '../src/App.scss';
import '../src/animations.css';

export default {
  component: GameBoard,
  props: {
    ...state,
    dispatch: (obj) => {
      console.log('dispatching');
      console.log(obj);
    }
  }
};