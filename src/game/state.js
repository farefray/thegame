const {
  Map,
  List,
} = require('immutable');
const deckJS = require('../deck');
const playerJS = require('../player');
const f = require('../f');
const gameConstantsJS = require('../game_constants');
const ShopJS = require('./shop');

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
};

StateJS.increaseExp = (stateParam, playerIndex, amountParam) => {
  let state = stateParam;
  let player = state.getIn(['players', playerIndex]);
  let level = player.get('level');
  let exp = player.get('exp');
  let expToReach = player.get('expToReach');
  let amount = amountParam;
  if (level === 10) return state;
  while (amount >= 0) {
    // console.log('increaseExp', level, exp, expToReach)
    // console.log(exp, level, expToReach, amount, expToReach > exp + amount);
    if (expToReach > exp + amount) { // not enough exp to level up
      exp += amount;
      amount = 0;
      player = player.set('level', level);
      player = player.set('exp', exp);
      player = player.set('expToReach', expToReach);
      state = state.setIn(['players', playerIndex], player);
      break;
    } else { // Leveling up
      level += 1;
      if (level === 10) {
        player = player.set('level', level);
        player = player.set('exp', 0);
        player = player.set('expToReach', 'max');
        state = state.setIn(['players', playerIndex], player);
        break;
      }
      amount -= expToReach - exp;
      expToReach = gameConstantsJS.getExpRequired(level);
      // 2exp -> 4 when +5 => lvlup +3 exp: 5 = 5 - (4 - 2) = 5 - 2 = 3
      exp = 0;
    }
  }
  // console.log('increaseExp leaving', level, exp, expToReach)
  return state;
};


/**
 * *This is not a player made action, time based event for all players
 * *When last battle is over this method shall be called
 * Increase players exp by 1
 * Refresh shop as long as player is not locked
 * Gold:
 *  Interest for 10 gold
 *  Increasing throughout the game basic income
 *  Win streak / lose streak
 */
StateJS.endTurn = async (stateParam) => {
  let state = stateParam;
  const income_basic = state.get('income_basic') + 1;
  const round = state.get('round');
  const roundType = gameConstantsJS.getRoundType(round);
  state = state.set('round', round + 1);
  if (round <= 5) {
    state = state.set('income_basic', income_basic);
  }

  // While temp
  const iter = state.get('players').keys();
  let temp = iter.next();
  while (!temp.done) {
    const index = temp.value;
    const locked = state.getIn(['players', index, 'locked']);
    if (!locked) {
      state = await ShopJS.refreshShop(state, index);
      // console.log('Not locked for player[' + i + '] \n', state.get('pieces').get(0));
    }
    state = await StateJS.increaseExp(state, index, 1);
    const gold = state.getIn(['players', index, 'gold']);
    // Min 0 gold interest -> max 5
    const bonusGold = Math.min(Math.floor(gold / 10), 5);
    const streak = state.getIn(['players', index, 'streak']) || 0;
    const streakGold = (roundType === 'pvp' ? Math.min(Math.floor(
      (streak === 0 || Math.abs(streak) === 1 ? 0 : (Math.abs(streak) / 5) + 1),
    ), 3) : 0);
    const newGold = gold + income_basic + bonusGold + streakGold;
    /*
    console.log(`@playerEndTurn Gold: p[${index + 1}]: `,
      `${gold}, ${income_basic}, ${bonusGold}, ${streakGold} (${streak}) = ${newGold}`);
    */
    state = state.setIn(['players', index, 'gold'], newGold);
    temp = iter.next();
  }
  const newState = await state;
  return newState;
};

module.exports = StateJS;
