const {
  Map,
  List,
  fromJS,
} = require('immutable');
const pawns = require('../pawns');
const f = require('../f');
const gameConstantsJS = require('../game_constants');

const ShopJS = {};

/**
 * Finds correct rarity for piece (random value)
 * Returns the piece taken from pieceStorage from correct rarity list
 * i is used to know which rarity it is checking (from 1 to 5)
 * Made sure after method that rarity contain pieces
 */
ShopJS.getPieceFromRarity = async (random, prob, index, pieceStorage, unitAmounts, newUnitAmounts) => {
  let piece;
  let pieceIndex;
  if (prob > random) {
    if (f.isUndefined(unitAmounts)) {
      piece = pieceStorage.get(index).get(0);
      pieceIndex = 0;
    } else {
      const keys = Array.from(unitAmounts.keys());
      for (let i = 0; i < keys.length; i++) {
        const tempPiece = pieceStorage.get(index).get(i);
        if (!keys.includes(tempPiece) || (keys.includes(tempPiece) && (((unitAmounts.get(tempPiece) || 0) + (newUnitAmounts.get(tempPiece) || 0)) < 9))) {
          /*if (unitAmounts.get(tempPiece) === 8) 
          console.log('@getPieceFromRarity 8 Units, Adding one', (newUnitAmounts.get(tempPiece) || 0), (unitAmounts.get(tempPiece) || 0), tempPiece, 
          ((unitAmounts.get(tempPiece) || 0) + (newUnitAmounts.get(tempPiece) || 0)), unitAmounts, newUnitAmounts);*/
          piece = tempPiece;
          pieceIndex = i;
          break;
        }
      }
    }
  }
  return Map({ piece, index: pieceIndex });
};

/**
 * Fills pieceStorage with discardedPieces
 */
ShopJS.refillPieces = async (pieces, discardedPieces) => {
  let pieceStorage = pieces;
  if (discardedPieces.size === 0) {
    return pieces;
  }
  console.log(`@refillPieces Refilling ${discardedPieces.size} units (Pieces size = ${pieces.size})`); // pieceStorage
  for (let i = 0; i < discardedPieces.size; i++) {
    const name = discardedPieces.get(i);
    const pokeStats = await pawns.getStats(name);
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
    }*/
    if (f.isUndefined(pieceStorage.get(cost - 1))) {
      console.log('@RefillPieces Undefined', cost - 1, pieceStorage.get(cost - 1), name);
      pieceStorage = await pieceStorage.set(cost - 1, List([]));
    }

    pieceStorage = await f.push(pieceStorage, cost - 1, name);
    // console.log('@refillPieces', name);
  }
  return pieceStorage;
};

/**
 * Updates shop with a new piece from getPieceFromRarity
 * Removes the piece from correct place in pieceStorage
 */
ShopJS.addPieceToShop = async (shop, pos, pieces, level, discPieces, player, newUnitAmounts) => {
  const prob = gameConstantsJS.getPieceProbabilityNum(level);
  let newShop = shop;
  let newPieceStorage = pieces;
  let newDiscPieces = discPieces;
  // TODO: Get amount of units of different types
  // Units at 9 => add to not allowed list
  const unitAmounts = player.get('unitAmounts');
  // console.log('addPieceToShop LEVEL ', level, prob)
  for (let i = 0; i < 5; i++) { // Loop over levels
    // If any piece storage goes empty -> put all discarded pieces in pieces
    // console.log('@addPieceToShop', discPieces)
    if (newPieceStorage.get(i).size === 0) {
      newPieceStorage = await ShopJS.refillPieces(newPieceStorage, discPieces);
      newDiscPieces = List([]);
    }
    // TODO: In theory, pieces might still be empty here, if not enough pieces were in the deck.
    // Temp: Assumes enough pieces are available
    const random = Math.random();
    //console.log('Before call:', i, newUnitAmounts)
    const pieceObj = await ShopJS.getPieceFromRarity(random, prob[i], i, newPieceStorage, unitAmounts, newUnitAmounts);
    const piece = pieceObj.get('piece');
    const pieceIndex = pieceObj.get('index');
    if (!f.isUndefined(piece)) {
      const unitStats = await pawns.getStats(piece);
      let newShopUnit = Map({
        name: piece,
        displayName: unitStats.get('displayName'),
        cost: unitStats.get('cost'),
        type: unitStats.get('type'),
      });
      if (unitStats.get('reqEvolve')) {
        newShopUnit = newShopUnit.set('reqEvolve', unitStats.get('reqEvolve'));
      }
      newShop = newShop.set(pos, newShopUnit);
      // Removes first from correct rarity array
      newPieceStorage = await f.removeFromPieceStorage(newPieceStorage, i, pieceIndex);
      newUnitAmounts = newUnitAmounts.set(piece, (newUnitAmounts.get(piece) || 0) + 1);
      //console.log('@newUnitAmounts', piece, newUnitAmounts);
      break;
    }
  }
  return {
    newShop,
    pieceStorage: newPieceStorage,
    discPieces: newDiscPieces,
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
ShopJS.refreshShop = async (stateParam, playerIndex) => {
  let state = stateParam;
  const level = state.getIn(['players', playerIndex, 'level']);
  let newShop = Map({});
  let pieceStorage = state.get('pieces');
  let discPieces = state.get('discardedPieces');
  let newUnitAmounts = Map({});
  for (let i = 0; i < 5; i++) { // Loop over pieces
    if (!level) console.log('@refreshShop adding piece', level, playerIndex);
    const obj = await ShopJS.addPieceToShop(newShop, f.pos(i), pieceStorage, level, discPieces, state.getIn(['players', playerIndex]), newUnitAmounts);
    newShop = obj.newShop;
    pieceStorage = obj.pieceStorage;
    discPieces = obj.discPieces;
    newUnitAmounts = obj.newUnitAmounts;
  }
  const shop = state.getIn(['players', playerIndex, 'shop']);
  if (shop.size !== 0) {
    const iter = shop.values();
    let temp = iter.next();
    let tempShopList = List([]);
    while (!temp.done) {
      tempShopList = tempShopList.push(temp.value.get('name'));
      temp = iter.next();
    }
    const shopList = await tempShopList;
    const filteredShop = shopList.filter(piece => !f.isUndefined(piece));
    const shopToList = fromJS(Array.from(filteredShop.map((value, key) => value).values()));
    // console.log('@refreshShop:', shopToList, '(', pieceStorage.size, '/', discPieces.size, ')');
    state = state.set('discardedPieces', discPieces.concat(shopToList));
  }
  state = state.setIn(['players', playerIndex, 'shop'], newShop);
  state = state.set('pieces', pieceStorage);
  return state;
};

module.exports = ShopJS;
