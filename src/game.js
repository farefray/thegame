

const {
  List, fromJS,
} = require('immutable');

const pawns = require('./pawns');
const f = require('./f');
const shopJS = require('./game/shop');
const BattleJS = require('./game/battle');
const StateJS = require('./game/state');
const BoardJS = require('./game/board');

const State = require('./objects/State');
const Player = require('./objects/Player');


// Cost of 2 gold(todo check for balance?)
exports.refreshShopGlobal = async (stateParam, index) => {
  const state = stateParam.setIn(['players', index, 'gold'], stateParam.getIn(['players', index, 'gold']) - 2);
  return shopJS.refreshShop(state, index);
};

/**
 * *Assumed hand not full here
 * *Assumed can afford
 * Remove unit from shop
 * Add unit to hand
 * Remove money from player
 *  Amount of money = getUnit(unitId).cost
 */
exports.buyUnit = async (stateParam, playerIndex, unitID) => {
  let state = stateParam;
  // console.log('@buyunit', unitID, playerIndex, f.pos(unitID));
  // console.log(state.getIn(['players', playerIndex, 'shop']));
  let shop = state.getIn(['players', playerIndex, 'shop']);
  const unit = shop.get(f.pos(unitID)).get('name');
  if (!f.isUndefined(unit)) {
    shop = shop.delete(f.pos(unitID));
    state = state.setIn(['players', playerIndex, 'shop'], shop);

    const hand = state.getIn(['players', playerIndex, 'hand']);
    const unitInfo = await pawns.getStats(unit);
    const handIndex = await BoardJS.getFirstAvailableSpot(state, playerIndex); // TODO: Go: Get first best hand index
    // console.log('@buyUnit handIndex', handIndex);
    const unitHand = await BoardJS.getBoardUnit(unit, f.x(handIndex));
    // console.log('@buyUnit unitHand', unitHand)
    state = state.setIn(['players', playerIndex, 'hand'], hand.set(unitHand.get('position'), unitHand));

    const currentGold = state.getIn(['players', playerIndex, 'gold']);
    state = state.setIn(['players', playerIndex, 'gold'], currentGold - unitInfo.get('cost'));
    state = state.setIn(['players', playerIndex, 'unitAmounts', unit], (state.getIn(['players', playerIndex, 'unitAmounts', unit]) || 0) + 1);
  }
  return state;
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

exports.placePieceGlobal = async (stateParam, playerIndex, fromPosition, toPosition, shouldSwap = 'true') => BoardJS.placePiece(stateParam, playerIndex, fromPosition, toPosition, shouldSwap);

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
