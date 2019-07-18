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

module.exports = StateJS;
