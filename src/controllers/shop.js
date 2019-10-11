const _ = require('lodash');
const pawns = require('../pawns');
const f = require('../f');
const gameConstantsJS = require('../game_constants');

const ShopJS = {};

/**
 * Fills pieceStorage with discardedPieces
 */
ShopJS.refillPieces = async (pieces, discardedPieces) => {
  const pieceStorage = pieces;
  if (discardedPieces.length === 0) {
    return pieces;
  }
  console.log(`@refillPieces Refilling ${discardedPieces.size} units (Pieces size = ${pieces.size})`); // pieceStorage
  for (let i = 0; i < discardedPieces.size; i++) {
    const name = discardedPieces[i];
    const pokeStats = pawns.getMonsterStats(name);
    const cost = pokeStats.get('cost');
    if (pokeStats.get('evolves_from')) {
      console.log('REFILLING NOT BASE UNIT @refillPieces', name);
    }
    /*
    if (f.isUndefined(pieceStorage.get(0)) || f.isUndefined(pieceStorage.get(1)) || f.isUndefined(pieceStorage.get(2))
        || f.isUndefined(pieceStorage.get(3)) || f.isUndefined(pieceStorage.get(4))) {
      console.log('@refillPieces pieceStorage WAS UNDEFINED HERE', pieceStorage);
      for (let j = 0; j < 5; j++) {
        if (f.isUndefined(pieceStorage.get(j))) {
          pieceStorage = pieceStorage.set(j, List([]));
        }
      }
    } */
    if (f.isUndefined(pieceStorage[cost - 1])) {
      console.log('@RefillPieces Undefined', cost - 1, pieceStorage[cost - 1], name);
      pieceStorage[cost - 1] = [];
    }

    pieceStorage[cost - 1].push(name);
    // console.log('@refillPieces', name);
  }
  return pieceStorage;
};

ShopJS.addPieceToShop = async (shop, pos, pieces, level, discPieces, player, newUnitAmounts) => {
  const newShop = _.clone(shop);
  let newPieceStorage = pieces;
  for (let i = 0; i < 5; i++) {
    if (newPieceStorage[i].length === 0) {
      newPieceStorage = await ShopJS.refillPieces(newPieceStorage, discPieces);
    }
    const newShopUnit = _.cloneDeep(pieces[0][Math.floor(Math.random() * pieces[0].length)]);
    newShop[pos] = newShopUnit;
    break;
  }
  return {
    newShop,
    pieceStorage: newPieceStorage,
    newUnitAmounts
  };
};

/**
 * Refresh shop
 * Generate newShop from pieces and update pieces to newPieces
 * Update discarded cards from previous shop
 * Add new shop
 * TODO: Add logic for piece cap, max 9 units
 */
ShopJS.refreshShop = async (state, playerIndex) => {
  const level = state.getIn(['players', playerIndex, 'level']);
  let newShop = {};
  let pieceStorage = state.get('pieces');
  let discPieces = state.get('discardedPieces');
  let newUnitAmounts = {};
  for (let i = 0; i < 5; i++) {
    // Loop over pieces
    if (!level) console.log('@refreshShop adding piece', level, playerIndex);
    const obj = await ShopJS.addPieceToShop(newShop, String(i), pieceStorage, level, discPieces, state.getIn(['players', playerIndex]), newUnitAmounts);
    newShop = obj.newShop;
    pieceStorage = obj.pieceStorage;
    discPieces = obj.discPieces;
    newUnitAmounts = obj.newUnitAmounts;
  }
  const shop = state.getIn(['players', playerIndex, 'shopUnits']);
  if (Object.keys(shop).length) {
    // todo check this
    const shopList = [];
    Object.keys(shop).forEach(pawn => {
      shopList.push(pawn.name);
    });

    const filteredShop = shopList.filter(piece => !f.isUndefined(piece));
    const shopToList = filteredShop.map((value, key) => value); // was .values() not sure now
    console.log('@refreshShop:', shopToList, '(', pieceStorage, '/', discPieces, ')');
    state.set('discardedPieces', discPieces.concat(shopToList));
  }
  state.setIn(['players', playerIndex, 'shopUnits'], newShop);
  state.set('pieces', pieceStorage);
  return state;
};

module.exports = ShopJS;
