import Monster from '../../abstract/Monster';
import config from './Minotaur.config.json';
import hoof from '../../spells/hoof';

function Minotaur() {
  return Monster({
    ...config,
    spell: {
      manacost: 100,
      execute: hoof,
      config: {
        ticks: 5000,
        effectId: 'stars'
      }
    }
  });
}

export default Minotaur;
