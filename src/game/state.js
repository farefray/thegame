const {
  Map,
  List,
  Set,
  fromJS,
} = require('immutable');
const deckJS = require('../deck');
const playerJS = require('../player');
const f = require('../f');
const gameConstantsJS = require('../game_constants');

const StateJS = {};

StateJS.initEmpty = async (amountPlaying, optList) => {
  const pieceStorage = await deckJS.buildPieceStorage(optList);
  const state = Map({
    pieces: pieceStorage,
    discardedPieces: List([]),
    round: 1, // (gameConstantsJS.debugMode ? 8 : 1),
    income_basic: 1,
  });

  return playerJS.initPlayers(state, amountPlaying);
};

/**
 * Get first available spot on hand
 */
StateJS.getFirstAvailableSpot = async (state, playerIndex) => {
  const hand = state.getIn(['players', playerIndex, 'hand']);
  // console.log('@getFirst', hand.keys().value)
  for (let i = 0; i < 8; i++) {
    // Get first available spot on bench
    const pos = f.pos(i);
    // console.log('inner', hand.get(pos), hand.get(String(pos)))
    if (f.isUndefined(hand.get(pos)) && f.isUndefined(hand.get(String(pos)))) {
      return pos;
    }
  }
  // Returns undefined if hand is full
  return undefined;
}

module.exports = StateJS;
