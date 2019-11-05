import * as spells from '../spells/loader';

// Spell loader utils
const Spells = {};

Object.keys(spells.default).forEach(element => {
  const spellName = element.toLowerCase();
  Spells[spellName] = spells.default[element];
});

Spells.loadSpell = (name, proto) => new Spells[name.toLowerCase()](proto);

export default Spells;
