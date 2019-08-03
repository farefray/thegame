const fs = require('fs');
const f = require('./f');
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
  next_move: 0, // Next move: time for next move
};

/**
 * Read from json file
 * Convert to immutable Map structure
 *
 * ☆ = &#9734;
 * Level is same as cost
 */
async function loadMonstersJSON() {
  return JSON.parse(fs.readFileSync('monsters.json', 'utf8'));
}

const monstersMap = loadMonstersJSON();
exports.getStats = async (name) => {
  const mobsMap = await monstersMap;
  // console.log('getStats', name);//, pokeMap.get(name.toLowerCase()));
  if (!name) {
    console.log('@getStats undefined', name);
  }

  return mobsMap[name.toLowerCase()];
};

const getBaseLocal = async (name) => {
  const mobsMap = await monstersMap;
  const unitStats = mobsMap[name.toLowerCase()];
  // console.log('@getBaseLocal', unitStats, name, unitStats.get('evolves_from'));
  if (f.isUndefined(unitStats.evolves_from)) { // Base level
    // console.log('@getBase This pokemon is a base unit: ', unitStats.get('name'), unitStats.get('evolves_from'), f.isUndefined(unitStats.get('evolves_from')));
    return unitStats.name;
  }
  // Go down a level
  // console.log('@.getBaseMonster Check out', unitStats.get('evolves_from'))
  return getBaseLocal(unitStats.evolves_from);
};

exports.getBaseMonster = name => getBaseLocal(name);

const getUnitTierLocal = async (name, counter = 1) => {
  const mobsMap = await monstersMap;
  const unitStats = mobsMap[name.toLowerCase()];
  if (f.isUndefined(unitStats.evolves_from)) { // Base level
    // console.log('@getBase This pokemon is a base unit: ', unitStats.get('name'), unitStats.get('evolves_from'), f.isUndefined(unitStats.get('evolves_from')));
    return counter;
  }
  // Go down a level
  // console.log('@.getBaseMonster Check out', unitStats.get('evolves_from'))
  return getUnitTierLocal(unitStats.evolves_from, counter + 1);
};

exports.getUnitTier = name => getUnitTierLocal(name);

exports.getMonsterMap = async () => monstersMap;


exports.getStatsDefault = stat => defaultStat[stat];