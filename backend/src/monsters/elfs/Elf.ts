import Monster from '../../abstract/Monster';
import config from './Elf.config.json';

function Elf() {
  return Monster(config);
}

export default Elf;
