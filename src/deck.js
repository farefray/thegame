const f = require('./f');
const pawns = require('./pawns');

const Decks = {};
const _buildDecks = async () => {
  const monsterMap = await pawns.getMonsterMap();

  Object.keys(monsterMap).forEach(monsterName => {
    const monster = monsterMap[monsterName];
    if (!Decks[monster.cost - 1]) {
      Decks[monster.cost - 1] = [];
    }

    Decks[monster.cost - 1].push(monster);
  });
};

_buildDecks();

exports.getDecks = () => Decks;

/**
 * Builds deck of pokemon loaded from pokemon.js
 * Optional parameter to choose pokemon for deck (mainly for testing)
 */
exports.buildPieceStorage = async optList => {
  let availablePieces = [[], [], [], [], []];
  const decks = await Decks;
  // console.log('@buildPieceStorage: decks', decks)
  for (let i = 0; i < decks.size; i++) {
    for (let j = 0; j < decks.get(i).size; j++) {
      const pokemon = decks.get(i).get(j);
      if (f.isUndefined(optList) || optList.includes(pokemon.get('name'))) {
        const rarityAmount = 3;
        // console.log('Adding', rarityAmount, pokemon.get('name'), 'to', pokemon.get('cost'));
        for (let l = 0; l < rarityAmount; l++) {
          availablePieces = f.push(availablePieces, i, pokemon.get('name'));
        }
      }
    }

    availablePieces = f.shuffle(availablePieces, i);
  }
  // console.log('\n@buildPieceStorage: availablePieces', availablePieces)
  return availablePieces;
};
