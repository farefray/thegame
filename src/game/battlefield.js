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
const StateJS = require('./state');
const pawns = require('../pawns');
const BattleunitJS = require('./battleunit');

const BattlefieldJS = {};

/**
 * Combines two boards into one for battle
 * Adds all relevant stats for the unit to the unit
 * Reverses position for enemy units
 */
BattlefieldJS.combineBoards = async (board1, board2) => {
  const keysIter = board1.keys();
  let tempUnit = keysIter.next();
  let newBoard = Map({});
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const unit = board1.get(unitPos);
    const battleUnit = await BattleunitJS.createBattleUnit(unit, unitPos, 0);
    newBoard = await newBoard.set(unitPos, battleUnit);
    tempUnit = keysIter.next();
  }
  const keysIter2 = board2.keys();
  tempUnit = keysIter2.next();
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const newUnitPos = f.reverseUnitPos(unitPos); // Reverse unitPos
    const unit = board2.get(unitPos);
    const battleUnit = await BattleunitJS.createBattleUnit(unit, newUnitPos, 1);
    newBoard = await newBoard.set(newUnitPos, battleUnit);
    tempUnit = keysIter2.next();
  }
  return newBoard;
}


/**
 * WithdrawPiece from board to best spot on bench
 * * Assumes not bench is full
 */
BattlefieldJS.withdrawPiece = async (state, playerIndex, piecePosition) => {
  const benchPosition = await StateJS.getFirstAvailableSpot(state, playerIndex);
  // TODO: Handle placePiece return upgradeOccured
  return (await placePiece(state, playerIndex, piecePosition, benchPosition, false)).get('state');
}


/**
 * Place piece
 * Swap functionality by default, if something is there already
 * * Assumes that only half of the board is placed on
 * TODO: Mark units to be sent back if too many
 *       Do buff calculations and mark on board
 *       Return if PieceUpgrade occured Map({state, upgradeOccured: true})
 */
BattlefieldJS.placePiece = async (stateParam, playerIndex, fromPosition, toPosition, shouldSwap = 'true') => {
  let piece;
  let state = stateParam;
  if (f.checkHandUnit(fromPosition)) { // from hand
    // console.log('@placePiece placeOnBoard', fromPosition, state.getIn(['players', playerIndex, 'hand']));
    piece = state.getIn(['players', playerIndex, 'hand', fromPosition]).set('position', toPosition);
    const newHand = state.getIn(['players', playerIndex, 'hand']).delete(fromPosition);
    state = state.setIn(['players', playerIndex, 'hand'], newHand);
  } else { // from board
    // console.log('@placePiece', fromPosition);
    // console.log('@placePiece board', state.getIn(['players', playerIndex, 'board']));
    piece = state.getIn(['players', playerIndex, 'board', fromPosition]).set('position', toPosition);
    const newBoard = state.getIn(['players', playerIndex, 'board']).delete(fromPosition);
    state = state.setIn(['players', playerIndex, 'board'], newBoard);
  }
  let newPiece;
  if (f.checkHandUnit(toPosition)) { // to hand
    newPiece = state.getIn(['players', playerIndex, 'hand', toPosition]);
    state = state.setIn(['players', playerIndex, 'hand', toPosition], piece);
  } else { // to board
    newPiece = state.getIn(['players', playerIndex, 'board', toPosition]);
    state = state.setIn(['players', playerIndex, 'board', toPosition], piece);
  }
  if (shouldSwap && !f.isUndefined(newPiece)) { // Swap allowed
    if (f.checkHandUnit(fromPosition)) { // Swap newPiece to hand
      state = state.setIn(['players', playerIndex, 'hand', fromPosition], newPiece.set('position', fromPosition));
    } else { // Swap newPiece to board
      state = state.setIn(['players', playerIndex, 'board', fromPosition], newPiece.set('position', fromPosition));
    }
  }
  // console.log(state.getIn(['players', playerIndex, 'board']));
  const tempMarkedResults = await markBoardBonuses(state.getIn(['players', playerIndex, 'board']));
  const tempBoard = tempMarkedResults.get('newBoard');
  let upgradeOccured = false;
  if (!f.checkHandUnit(toPosition)) {
    const obj = await checkPieceUpgrade(state.setIn(['players', playerIndex, 'board'], tempBoard), playerIndex, tempBoard.get(toPosition), toPosition);
    state = obj.get('state');
    upgradeOccured = obj.get('upgradeOccured');
  }
  if (shouldSwap && !f.isUndefined(newPiece) && !f.checkHandUnit(fromPosition)) {
    const obj = await checkPieceUpgrade(state.setIn(['players', playerIndex, 'board'], tempBoard), playerIndex, tempBoard.get(fromPosition), fromPosition);
    state = obj.get('state');
    upgradeOccured = obj.get('upgradeOccured') || upgradeOccured;
  }
  const markedResults = await markBoardBonuses(state.getIn(['players', playerIndex, 'board']));
  const buffMap = markedResults.get('buffMap').get('0');
  const typeBuffMapSolo = markedResults.get('typeBuffMapSolo').get('0');
  const typeBuffMapAll = markedResults.get('typeBuffMapAll').get('0');
  const typeDebuffMapEnemy = markedResults.get('typeDebuffMapEnemy').get('0');
  // Add this information to the state, boardBuffs

  const boardBuffs = Map({
    buffMap, typeBuffMapSolo, typeBuffMapAll, typeDebuffMapEnemy,
  });
  // console.log('@boardBuffs', boardBuffs);
  state = state.setIn(['players', playerIndex, 'boardBuffs'], boardBuffs);
  const markedBoard = markedResults.get('newBoard');
  state = state.setIn(['players', playerIndex, 'board'], markedBoard);
  return Map({ state, upgradeOccured });
}

/**
 * Counts unique occurences of piece on board connected to each team
 * Puts them in a map and returns it
 * Map({0: Map({grass: 3, fire: 2}), 1: Map({normal: 5})})
 * Set(['pikachu']) (no more pikachus or raichus)
 */
BattlefieldJS.countUniqueOccurences = async (board, teamParam = '0') => {
  const boardKeysIter = board.keys();
  let tempUnit = boardKeysIter.next();
  let buffMap = Map({ 0: Map({}), 1: Map({}) });
  let unique = Map({ 0: Set([]), 1: Set([]) });
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const unit = board.get(unitPos);
    const name = unit.get('name');
    // console.log('@countUnique UNIT', name)
    const team = unit.get('team') || teamParam;
    // console.log(unique, team, unit, unitPos)
    // console.log('@countUniqueOccurences', unique.get(String(team)), pawns.getBasePokemon(name))
    const basePokemon = await pawns.getBasePokemon(name);
    if (!unique.get(String(team)).has(basePokemon)) { // TODO: Check
      // f.p('@CountUniqueOccurences Unique', basePokemon, team, unique);
      const newSet = await unique.get(String(team)).add(basePokemon);
      unique = await unique.set(String(team), newSet); // Store unique version, only count each once
      const types = unit.get('type'); // Value or List
      if (!f.isUndefined(types.size)) { // List
        for (let i = 0; i < types.size; i++) {
          buffMap = buffMap.setIn([String(team), types.get(i)], (buffMap.getIn([String(team), types.get(i)]) || 0) + 1);
        }
      } else { // Value
        buffMap = buffMap.setIn([String(team), types], (buffMap.getIn([String(team), types]) || 0) + 1);
        // console.log('adding type occurence', name, team, buffMap.getIn([String(team), types]))
      }
    }
    tempUnit = boardKeysIter.next();
  }
  f.p('@CountUniqueOccurences', unique);
  return buffMap;
}

module.exports = BattlefieldJS;
