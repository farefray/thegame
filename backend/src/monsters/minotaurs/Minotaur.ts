import Monster from '../../abstract/Monster';
import config from './Minotaur.config.json';

function Minotaur() {
  return Monster(config);
}

export default Minotaur;
