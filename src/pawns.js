const {
  Map,
  fromJS
} = require('immutable');
const fs = require('fs');
const f = require('./f');
/**
 * Default stat variables that are used if nothing is found in specific def
 */
const defaultStat = Map({
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
});

/**
 * Read from json file
 * Convert to immutable Map structure
 *
 * ☆ = &#9734;
 * Level is same as cost
 */
async function loadImmutableMonstersJSON() {
  const monstersJSON = JSON.parse(fs.readFileSync('monsters.json', 'utf8'));
  return fromJS(monstersJSON);
}

// Should be moved to another file TODO
// make Promise version of fs.readdir()
const monstersDIR = 'app/src/shared/monsters/';
fs.readdirAsync = function (dirname) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, filenames) => {
      if (err) {
        reject(err);
      } else {
        resolve(filenames);
      }
    });
  });
};

// make Promise version of fs.readFile()
fs.readFileAsync = (filename, enc) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, enc, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};


// read all json files in the directory, filter out those needed to process, and using Promise.all to time when all async readFiles has completed. 
function loadMonsterImages() {
  return new Promise((resolve) => {
    fs.readdirAsync(monstersDIR).then((filenames) => {
      return Promise.all(filenames.map((filename) => {
        return fs.readFileAsync(monstersDIR + filename, 'utf8');
      }));
    }).then((files) => {
      const summary = {};
      files.forEach((file) => {
        const json_file = JSON.parse(file);
        const monsterName = json_file.name.toLowerCase();
        delete json_file.name;
        summary[monsterName] = json_file;
      });

      return resolve(summary);
    });
  });
}

async function loadSpritesJSON() {
  const sprites = await loadMonsterImages();
  return fromJS(sprites);
}

const monstersMap = loadImmutableMonstersJSON();
const monsterSprites = loadSpritesJSON();

exports.getStats = async (name) => {
  const mobsMap = await monstersMap;
  // console.log('getStats', name);//, pokeMap.get(name.toLowerCase()));
  if (f.isUndefined(name)) console.log('@getStats undefined', name);
  return mobsMap.get(name.toLowerCase());
};

const getBaseLocal = async (name) => {
  const mobsMap = await monstersMap;
  const unitStats = mobsMap.get(name.toLowerCase());
  // console.log('@getBaseLocal', unitStats, name, unitStats.get('evolves_from'));
  if (f.isUndefined(unitStats.get('evolves_from'))) { // Base level
    // console.log('@getBase This pokemon is a base unit: ', unitStats.get('name'), unitStats.get('evolves_from'), f.isUndefined(unitStats.get('evolves_from')));
    return unitStats.get('name');
  }
  // Go down a level
  // console.log('@.getBaseMonster Check out', unitStats.get('evolves_from'))
  return getBaseLocal(unitStats.get('evolves_from'));
};

exports.getBaseMonster = name => getBaseLocal(name);

const getUnitTierLocal = async (name, counter = 1) => {
  const mobsMap = await monstersMap;
  const unitStats = mobsMap.get(name.toLowerCase());
  if (f.isUndefined(unitStats.get('evolves_from'))) { // Base level
    // console.log('@getBase This pokemon is a base unit: ', unitStats.get('name'), unitStats.get('evolves_from'), f.isUndefined(unitStats.get('evolves_from')));
    return counter;
  }
  // Go down a level
  // console.log('@.getBaseMonster Check out', unitStats.get('evolves_from'))
  return getUnitTierLocal(unitStats.get('evolves_from'), counter + 1);
};

exports.getUnitTier = name => getUnitTierLocal(name);

exports.getMonsterMap = async () => monstersMap;

exports.getMonsterSprites = async () => monsterSprites;

exports.getStatsDefault = stat => defaultStat.get(stat);