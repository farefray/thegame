const monsters = require('./monsters.json');

/**
 * Default stat variables that are used if nothing is found in specific def
 */
const defaultStat = {
  evolves_from: undefined, // None Assumed - Not used
  /*
  mana_hit_given: 10,
  mana_hit_taken: 10,
  */
  mana_multiplier: 1,
  mana: 0,
  speed: 100, // Temp test, lower = faster (Time between attacks)
  upperLimitSpeed: 250,
  defense: 50,
  range: 1, // Range for unit to reach (diagonals allowed)
  next_move: 0 // Next move: time for next move
};

const Pawns = {};
Pawns.getMonsterStats = name => monsters[name.toLowerCase()];

const getBaseLocal = async name => {
  const unitStats = monsters[name.toLowerCase()];
  // console.log('@getBaseLocal', unitStats, name, unitStats.get('evolves_from'));
  if (!unitStats.evolves_from) {
    // Base level
    // console.log('@getBase This pokemon is a base unit: ', unitStats.get('name'), unitStats.get('evolves_from'), f.isUndefined(unitStats.get('evolves_from')));
    return unitStats.name;
  }
  // Go down a level
  // console.log('@.getBaseMonster Check out', unitStats.get('evolves_from'))
  return getBaseLocal(unitStats.evolves_from);
};

Pawns.getBaseMonster = name => getBaseLocal(name);

const getUnitTierLocal = async (name, counter = 1) => {
  const unitStats = monsters[name.toLowerCase()];
  if (!unitStats.evolves_from) {
    // Base level
    // console.log('@getBase This pokemon is a base unit: ', unitStats.get('name'), unitStats.get('evolves_from'), f.isUndefined(unitStats.get('evolves_from')));
    return counter;
  }
  // Go down a level
  // console.log('@.getBaseMonster Check out', unitStats.get('evolves_from'))
  return getUnitTierLocal(unitStats.evolves_from, counter + 1);
};

Pawns.getUnitTier = name => getUnitTierLocal(name);

Pawns.getMonsterMap = async () => monsters;

Pawns.getStatsDefault = stat => defaultStat[stat];

module.exports = Pawns;
