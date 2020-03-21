import Monster from '../../abstract/Monster';
import config from './Minotaur.json';

function Minotaur() {
  return Monster(config);
}

export default Minotaur;
