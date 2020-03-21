import Monster from '../../abstract/Monster';
import config from './Dwarf.json';

function Dwarf() {
  return Monster(config);
}

export default Dwarf;
