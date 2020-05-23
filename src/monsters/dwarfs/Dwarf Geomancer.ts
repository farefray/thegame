import Monster from '../../abstract/Monster';
import config from './Dwarf Geomancer.config.json';
import regeneration from '../../spells/regeneration';


function Dwarf_Geomancer() {
  return Monster({
    ...config,
    spell: {
      manacost: 100,
      execute: regeneration,
      config: {
        ticks: 5,
        tickValue: 45,
        tickDelay: 2000
      }
    }
  });
}

export default Dwarf_Geomancer;
