import Monster from '../../abstract/Monster';
import config from 'Beholder.json';

function Beholder() {
  return Monster(config);
}

export default Beholder;
