import Monster from '../abstract/Monster';
import config from './Dwarf.config.json';

export default function Dwarf() {
  return Monster({
    ...config
  });
}
