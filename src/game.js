

const {
  List, fromJS,
} = require('immutable');

const pawns = require('./pawns');
const f = require('./f');
const shopJS = require('./game/shop');
const BattleJS = require('./game/battle');
const StateJS = require('./game/state');
const BoardJS = require('./game/board');
const SessionJS = require('./session');

const State = require('./objects/State');
const Player = require('./objects/Player');


// Cost of 2 gold(todo check for balance?)
exports.refreshShopGlobal = async (stateParam, index) => {
  const state = stateParam.setIn(['players', index, 'gold'], stateParam.getIn(['players', index, 'gold']) - 2);
  return shopJS.refreshShop(state, index);
};

/**
 * toggleLock for player (setIn)
 */
exports.toggleLock = async (state, playerIndex) => {
  const locked = state.getIn(['players', playerIndex, 'locked']);
  if (!locked) {
    return state.setIn(['players', playerIndex, 'locked'], true);
  }
  return state.setIn(['players', playerIndex, 'locked'], false);
};

/**
 * Buy exp for player (setIn)
 */
exports.buyExp = (state, playerIndex) => {
  const gold = state.getIn(['players', playerIndex, 'gold']);
  const newState = state.setIn(['players', playerIndex, 'gold'], gold - 5);
  return StateJS.increaseExp(newState, playerIndex, 4);
};

exports.mutateStateByPawnPlacing = async (state, playerIndex, fromPosition, toPosition, shouldSwap = 'true') => {
  return BoardJS.mutateStateByPawnPlacing(state, playerIndex, fromPosition, toPosition, shouldSwap);
}

exports.withdrawPieceGlobal = async (state, playerIndex, piecePosition) => BattleJS.withdrawPiece(state, playerIndex, piecePosition);

exports.sellPieceGlobal = (state, playerIndex, piecePosition) => BoardJS.sellPiece(state, playerIndex, piecePosition);

exports.removeDeadPlayer = async (stateParam, playerIndex) => {
  // console.log('@removeDeadPlayer')
  let state = stateParam;
  const filteredShop = state.getIn(['players', playerIndex, 'shop']).filter(piece => !f.isUndefined(piece));
  const shopUnits = fromJS(Array.from(filteredShop.map((value, key) => value.get('name')).values()));
  const board = state.getIn(['players', playerIndex, 'board']);
  let boardList = List([]);
  const iter = board.keys();
  let temp = iter.next();
  while (!temp.done) {
    const uid = temp.value;
    const unit = board.get(uid);
    boardList = boardList.push(unit.get('name'));
    temp = iter.next();
  }
  // console.log('BoardList', boardList);
  const hand = state.getIn(['players', playerIndex, 'hand']);
  let handList = List([]);
  const iter2 = hand.keys();
  let temp2 = iter2.next();
  while (!temp2.done) {
    const uid = temp2.value;
    const unit = hand.get(uid);
    handList = handList.push(unit.get('name'));
    temp2 = iter2.next();
  }
  // console.log('HandList', handList);
  const playerUnits = shopUnits.concat(boardList).concat(handList);
  console.log('@removeDeadPlayer', shopUnits, boardList, handList, '=', playerUnits);
  for (let i = 0; i < playerUnits.size; i++) {
    state = await BoardJS.discardBaseUnits(state, playerIndex, playerUnits.get(i));
  }
  // state = state.set('discardedPieces', state.get('discardedPieces').concat(playerUnits));
  const newState = state.set('players', state.get('players').delete(playerIndex));
  // console.log('@removeDeadPlayer', newState.get('players'));
  const amountOfPlayers = newState.get('amountOfPlayers') - 1;
  return newState.set('amountOfPlayers', amountOfPlayers);
};


const deckJS = require('./deck');

const HAND_UNITS_LIMIT = 9;

/**
 *
 *
 * @param {*} state
 * @param {*} playerIndex
 * @param {*} pieceIndex
 * @returns {null||Object}
 */
exports.purchasePawn = async (state, playerIndex, pieceIndex) => {
  const player = state.getIn(['players', playerIndex]);
  /**
   * Checks to be done:
   * unit exist in shop
   * hand is not full
   * can afford
   */
  const unit = player.shop[pieceIndex];
  if (!unit
    || Object.keys(player.hand) >= HAND_UNITS_LIMIT
    || player.gold < unit.cost) {
    return null;
  }

  /**
  * remove unit from shop
  * add unit to hand
  * remove gold
  * set player state
  */
  const boardUnit = await BoardJS.getBoardUnit(unit.name);
  if (player.addToHand(boardUnit)) {
    delete player.shop[pieceIndex];
    player.gold -= unit.cost;

    // ????
    player.unitAmounts[unit.name] = player.unitAmounts[unit.name] ? player.unitAmounts[unit.name] + 1 : 0;
    state.setIn(['players', playerIndex], player);
    return state;
  }

  return null;
};

exports.initialize = async (clients) => {
  const playersArray = [];
  clients.forEach((client) => {
    playersArray.push(new Player(client));
  });

  let state = new State(playersArray, deckJS.getDecks());

  // TODO better way
  for (let i = 0; i < playersArray.length; i++) {
    state = await shopJS.refreshShop(state, playersArray[i].get('index'));
  }

  return state;
};


/**
* winner: Gain 1 gold
* loser: Lose hp
*      Calculate amount of hp to lose
* Parameters: Enemy player index, winningAmount = damage? (units or damage)
*/

exports.endBattle = async (stateParam, playerIndex, winner, finishedBoard, roundType, enemyPlayerIndex) => {
  let state = stateParam;
  // console.log('@Endbattle :', playerIndex, winner);
  if (f.isUndefined(finishedBoard)) console.log(finishedBoard);
  // console.log('@endBattle', state, playerIndex, winner, enemyPlayerIndex);
  const streak = state.getIn(['players', playerIndex, 'streak']) || 0;
  if (winner) { // Winner
    // TODO: Npc rewards and gym rewards
    switch (roundType) {
      case 'pvp': {
        const prevGold = state.getIn(['players', playerIndex, 'gold']);
        state = state.setIn(['players', playerIndex, 'gold'], prevGold + 1);
        const newStreak = (streak < 0 ? 0 : +streak + 1);
        state = state.setIn(['players', playerIndex, 'streak'], newStreak);
        f.p('@endBattle Won Player', playerIndex, prevGold, state.getIn(['players', playerIndex, 'gold']), newStreak);
        break;
      }
      case 'npc':
      case 'gym':
      /* TODO: Add item drops / special money drop */
      case 'shop':
      default:
    }
  } else { // Loser
    switch (roundType) {
      case 'pvp': {
        const newStreak = (streak > 0 ? 0 : +streak - 1);
        state = state.setIn(['players', playerIndex, 'streak'], newStreak);
        f.p('@Endbattle pvp', newStreak);
      }
      case 'npc': {
        const hpToRemove = await _calcDamageTaken(finishedBoard);
        state = await _removeHp(state, playerIndex, hpToRemove);
        f.p('@endBattle Lost Player', playerIndex, hpToRemove);
        break;
      }
      case 'gym': {
        const hpToRemove = await _calcDamageTaken(finishedBoard);
        const gymDamage = Math.min(hpToRemove, 3);
        state = await _removeHp(state, playerIndex, gymDamage);
        f.p('@endBattle Gymbattle');
      }
      case 'shop':
      default:
    }
  }
  // console.log('@endBattle prep', stateParam.get('players'));
  const potentialEndTurnObj = await _prepEndTurn(state, playerIndex);
  return potentialEndTurnObj;
};