import Monster from '../../abstract/Monster';
import config from './Dwarf Guard.json';

function Dwarf_Guard() {
  return Monster({...config});
}

export default Dwarf_Guard;
