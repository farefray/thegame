const {
  List
} = require('immutable');
const f = require('./f');
const pawns = require('./pawns');
const gameConstantsJS = require('./game_constants');

async function buildDecks(pokemonParam) {
  const pokemon = await pokemonParam;
  // console.log(pokemon)
  let decks = List([List([]), List([]), List([]), List([]), List([])]);
  const pokemonIterator = pokemon.values();
  let tempPokemon = pokemonIterator.next();
  while (!tempPokemon.done) {
    const pokemonVar = tempPokemon.value;
    // console.log(pokemon.get('evolves_from'))
    if (f.isUndefined(pokemonVar.get('evolves_from'))) { // Only add base level
      decks = f.push(decks, tempPokemon.value.get('cost') - 1, tempPokemon.value);
    }
    tempPokemon = pokemonIterator.next();
  }
  // console.log('@buildDecks, decks', decks)
  return decks;
}

let Decks = {};
pawns.getMonsterMap().then((map) => {
  Decks = buildDecks(map);
});

exports.getDecks = () => Decks;

/**
 * Builds deck of pokemon loaded from pokemon.js
 * Optional parameter to choose pokemon for deck (mainly for testing)
 */
exports.buildPieceStorage = async (optList) => {
  let availablePieces = List([List([]), List([]), List([]), List([]), List([])]);
  const decks = await Decks;
  // console.log('@buildPieceStorage: decks', decks)
  for (let i = 0; i < decks.size; i++) {
    for (let j = 0; j < decks.get(i).size; j++) {
      const pokemon = decks.get(i).get(j);
      if (f.isUndefined(optList) || optList.includes(pokemon.get('name'))) {
        const rarityAmount = gameConstantsJS.getRarityAmount(pokemon.get('cost'));
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