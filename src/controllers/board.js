const _ = require('lodash');
const f = require('../f');
const pawns = require('../pawns');
const abilitiesJS = require('../abilities');

const BoardJS = {};

/** Private methods */

/**
 * Checks all units on board for player of that piece type
 * if 3 units are found, remove those 3 units and replace @ position with evolution
 * No units are added to discardedPieces
 */
async function _checkPieceUpgrade(board, playerIndex, piece, position) {
  const name = piece['name'];
  const stats = pawns.getMonsterStats(name);
  if (!stats['evolves_to']) {
    return {
      board,
      upgradeOccured: false
    };
  }

  let pieceCounter = 0;
  const positions = [];

  const takenPositions = Object.keys(board);
  for (let index = 0; index < takenPositions.length; index++) {
    const key = takenPositions[index];
    const unit = board[key];
    if (unit['name'] === name) {
      pieceCounter += 1;
      positions.push(unit.position);
    }
  }

  let requiredAmount = 3;
  if (piece['reqEvolve']) {
    requiredAmount = piece['reqEvolve'];
    console.log('LESS UNITS REQUIRED FOR UPGRADE', piece['name'], requiredAmount);
  }
  if (pieceCounter >= requiredAmount) {
    // Upgrade unit @ position
    // console.log('UPGRADING UNIT', name);
    // let discPieces = state.get('discardedPieces'); // TODO discardedPieces???
    for (let i = 0; i < positions.size; i++) {
      const unit = board[positions[i]];
      // discPieces = discPieces.push(unit['name']);
      delete board[positions[i]];
    }
    // state = state.set('discardedPieces', discPieces);
    const evolvesUnit = stats['evolves_to'];
    let evolvesTo = evolvesUnit;
    if (evolvesTo && !f.isUndefined(evolvesTo.length)) {
      // List
      evolvesTo = evolvesUnit[f.getRandomInt(evolvesTo.length)];
    }
    // Check if multiple evolutions exist, random between
    const newPiece = BoardJS.getBoardUnit(evolvesTo); // not needed I guess
    // TODO: List -> handle differently
    const evolutionDisplayName = pawns.getMonsterStats(evolvesTo).get('displayName');
    // console.log('evolutionDisplayName', evolutionDisplayName);
    const nextPieceUpgrade = await _checkPieceUpgrade(board, playerIndex, newPiece, position);
    // Get both upgrades
    // TODO
    return nextPieceUpgrade.set('upgradeOccured', [evolutionDisplayName]).concat(nextPieceUpgrade.get('upgradeOccured') || []);
  }
  return {
    board,
    upgradeOccured: false
  };
}

/** Public methods */

/**
 * Create unit for board/hand placement from name and spawn position
 */
BoardJS.getBoardUnit = name => {
  const unitInfo = pawns.getMonsterStats(name); // this may be a overuse. Maybe units should be always Uni
  if (f.isUndefined(unitInfo)) console.log('UNDEFINED:', name);
  // console.log('@getBoardUnit', name, unitInfo)
  return unitInfo;
};

/**
 * Create unit for board battle from createBoardUnit unit given newpos/pos and team
 * @TODO maybe we need to use BattleUnit class here instead -.- !!!
 */
BoardJS.createBattleUnit = async (unit, unitPos, team) => {
  const unitStats = pawns.getMonsterStats(unit['name']);
  const ability = await abilitiesJS.getAbility(unit['name']);

  const battleUnit = _.cloneDeep(unit);
  // todo proper way :)
  unitStats.get = field => unitStats[field];
  const set = (where, what) => {
    battleUnit[where] = what;
    return this;
  };

  set('_uid', unitPos); // this is hack for BattleUnit functionality which is required on front.

  set('team', team);
  set('attack', unitStats.get('attack'));
  set('hp', unitStats['hp']);
  set('maxHp', unitStats['hp']);
  set('startHp', unitStats['hp']);
  set('type', unitStats.get('type'));
  set('next_move', unitStats.get('next_move') || pawns.getStatsDefault('next_move'));
  set('mana', unitStats['mana'] || pawns.getStatsDefault('mana'));
  set('ability', unitStats.get('ability'));
  set('armor', unitStats.get('armor') || pawns.getStatsDefault('armor'));
  set('speed', unitStats.get('speed'));
  /* .set('mana_hit_given', unitStats.get('mana_hit_given') || pawns.getStatsDefault('mana_hit_given'))
  set('mana_hit_taken', unitStats.get('mana_hit_taken') || pawns.getStatsDefault('mana_hit_taken')) */
  set('mana_multiplier', unitStats.get('mana_multiplier') || pawns.getStatsDefault('mana_multiplier'));
  set('specialAttack', unitStats.get('specialAttack'));
  set('specialDefense', unitStats.get('specialDefense'));
  set('position', unitPos); // its not being updated on move, imho need BattleUnit usage here
  set('attackRange', unitStats.get('attackRange') || pawns.getStatsDefault('attackRange'));
  set('manaCost', (ability && ability['mana']) || abilitiesJS.getDefault('mana'));

  return battleUnit;
};

/**
 * Combines two boards into one for battle
 * Adds all relevant stats for the unit to the unit
 * Reverses position for enemy units
 */
BoardJS.createBattleBoard = async (board1, board2) => {
  const newBoard = {};

  for (const unitPos in board1) {
    const unit = board1[unitPos];
    const battleUnit = await BoardJS.createBattleUnit(unit, unitPos, 0);
    newBoard[unitPos] = battleUnit;
  }

  for (const unitPos in board2) {
    const unit = board2[unitPos];
    const battleUnit = await BoardJS.createBattleUnit(unit, unitPos, 1);
    newBoard[unitPos] = battleUnit;
  }

  return newBoard;
};

/**
 * Get first available spot on hand
 */
BoardJS.getFirstAvailableSpot = async (state, playerIndex) => {
  const hand = state.getIn(['players', playerIndex, 'hand']);
  for (let i = 0; i < 8; i++) {
    const pos = f.pos(i);
    if (f.isUndefined(hand[pos]) && f.isUndefined(hand[pos])) {
      return pos;
    }
  }

  return undefined;
};

/**
 * WithdrawPiece from board to best spot on bench
 * * Assumes not bench is full
 */
BoardJS.withdrawPiece = async (state, playerIndex, piecePosition) => {
  const benchPosition = await BoardJS.getFirstAvailableSpot(state, playerIndex);
  // TODO: Handle placePiece return upgradeOccured
  await BoardJS.mutateStateByPawnPlacing(state, playerIndex, piecePosition, benchPosition, false);
  return true;
};

/**
 * Place piece
 * Swap functionality by default, if something is there already
 * * Assumes that only half of the board is placed on
 * TODO: Mark units to be sent back if too many
 *       Do buff calculations and mark on board
 *       Return if PieceUpgrade occured Map({state, upgradeOccured: true})
 */
BoardJS.mutateStateByPawnPlacing = async (state, playerIndex, fromPosition, toPosition, shouldSwap = 'true') => {
  const hand = state.getIn(['players', playerIndex, 'hand']);
  let board = state.getIn(['players', playerIndex, 'board']);

  let piece;
  // Update pawns positions and remove from old stores based on fromPosition
  if (f.isPositionBelongsToHand(fromPosition)) {
    piece = hand[fromPosition];
    hand[fromPosition].position = toPosition;
    delete hand[fromPosition];
  } else {
    piece = board[fromPosition];
    board[fromPosition].position = toPosition;
    delete board[fromPosition];
  }

  let newPiece;
  if (f.isPositionBelongsToHand(toPosition)) {
    newPiece = hand[toPosition];
    hand[toPosition] = piece;
  } else {
    newPiece = board[toPosition];
    board[toPosition] = piece;
  }

  if (shouldSwap && !f.isUndefined(newPiece)) {
    newPiece.position = fromPosition;

    if (f.isPositionBelongsToHand(fromPosition)) {
      hand[fromPosition] = newPiece;
    } else {
      board[fromPosition] = newPiece;
    }
  }

  // TODO
  // const tempBoard = tempMarkedResults.get('newBoard');

  let upgradeOccured = false;
  if (!f.isPositionBelongsToHand(toPosition)) {
    const obj = await _checkPieceUpgrade(board, playerIndex, board[toPosition], toPosition);
    board = obj['board'];
    upgradeOccured = obj['upgradeOccured'];
  }

  if (shouldSwap && !f.isUndefined(newPiece) && !f.isPositionBelongsToHand(fromPosition)) {
    const obj = await _checkPieceUpgrade(board, playerIndex, board[fromPosition], fromPosition);
    board = obj['board'];
    upgradeOccured = obj['upgradeOccured'] || upgradeOccured;
  }

  state.setIn(['players', playerIndex, 'hand'], hand);
  state.setIn(['players', playerIndex, 'board'], board);
  return {
    upgradeOccured
  };
};

/**
 * When units are sold, when level 1, a level 1 unit should be added to discardedPieces
 * Level 2 => 3 level 1 units, Level 3 => 9 level 1 units
 */
BoardJS.discardBaseUnits = async (stateParam, playerIndex, name, depth = 1) => {
  let state = stateParam;
  const unitStats = pawns.getMonsterStats(name);
  const evolutionFrom = unitStats.get('evolves_from');
  // console.log('@discardBaseUnits start', name, depth);
  if (f.isUndefined(evolutionFrom)) {
    // Base level
    let discPieces = state.get('discardedPieces');
    const amountOfPieces = 3 ** (depth - 1); // Math.pow
    console.log('@discardBaseUnits', amountOfPieces, depth, name);
    for (let i = 0; i < amountOfPieces; i++) {
      discPieces = discPieces.push(name);
    }
    const unitAmounts = state.getIn(['players', playerIndex, 'unitAmounts']);
    if (unitAmounts) {
      const newValue = unitAmounts.get(name) - amountOfPieces;
      if (newValue === 0) {
        state = state.setIn(['players', playerIndex, 'unitAmounts'], unitAmounts.delete(name));
      } else {
        state = state.setIn(['players', playerIndex, 'unitAmounts', name], newValue);
      }
    }
    return state.set('discardedPieces', await discPieces);
  }
  const newName = evolutionFrom;
  // console.log('@discardBaseUnits', newName, depth);
  return BoardJS.discardBaseUnits(state, playerIndex, newName, depth + 1);
};

/**
 * Sell piece
 * Increase money for player
 * Remove piece from position
 * add piece to discarded pieces
 */
BoardJS.sellPiece = async (state, playerIndex, piecePosition) => {
  // TODO test this
  let pieceTemp;
  if (f.isPositionBelongsToHand(piecePosition)) {
    pieceTemp = state.getIn(['players', playerIndex, 'hand', piecePosition]);
  } else {
    pieceTemp = state.getIn(['players', playerIndex, 'board', piecePosition]);
  }
  const piece = pieceTemp;
  const unitStats = pawns.getMonsterStats(piece.get('name'));
  const cost = unitStats.get('cost');
  const gold = state.getIn(['players', playerIndex, 'gold']);
  let newState = state.setIn(['players', playerIndex, 'gold'], +gold + +cost);
  if (f.isPositionBelongsToHand(piecePosition)) {
    const unitToSell = newState.getIn(['players', playerIndex, 'hand', piecePosition]);
    const newHand = newState.getIn(['players', playerIndex, 'hand']).delete(piecePosition);
    const newDiscardedPieces = newState.set('discardedPieces', newState.get('discardedPieces').push(unitToSell.get('name')));
    newState = newDiscardedPieces.setIn(['players', playerIndex, 'hand'], newHand);
  } else {
    const unitToSell = newState.getIn(['players', playerIndex, 'board', piecePosition]);
    const newBoard = newState.getIn(['players', playerIndex, 'board']).delete(piecePosition);
    const newDiscardedPieces = newState.set('discardedPieces', newState.get('discardedPieces').push(unitToSell.get('name')));
    newState = newDiscardedPieces.setIn(['players', playerIndex, 'board'], newBoard);
  }
  // Add units to discarded Cards, add base level of card
  return BoardJS.discardBaseUnits(newState, playerIndex, piece.get('name'));
};

/**
 * Help function in creating battle boards
 * Use together with combine boards
 */
BoardJS.createBoard = async inputList => {
  //console.log('TCL: BoardJS.createBoard -> inputList', inputList);
  const board = {};
  for (let i = 0; i < inputList.length; i++) {
    const el = inputList[i];
    const unit = BoardJS.getBoardUnit(el['name']);
    board[f.pos(el.x, el.y)] = unit;
  }
  return board;
};

/**
 * Board for player with playerIndex have too many units
 * Try to withdraw the cheapest unit
 * if hand is full, sell cheapest unit
 * Do this until board.size == level
 */
const _mutateStateByFixingUnitLimit = async function(state, playerIndex) {
  const board = state.getIn(['players', playerIndex, 'board']);
  // Find cheapest unit
  const takenPositions = Object.keys(board);
  let unitCost = Infinity;
  let cheapestUnitPosition = null;

  for (let index = 0; index < takenPositions.length; index++) {
    const pos = takenPositions[index];
    const unit = board[pos];
    // Todo check if this will be covered for leveled up units
    if (unit.cost < unitCost) {
      cheapestUnitPosition = pos;
      unitCost = unit.cost;
    }
  }

  // Withdraw if possible unit, otherwise sell
  // TODO: Inform Client about update
  if (Object.keys(state.getIn(['players', playerIndex, 'hand'])).length < 8) {
    await BoardJS.withdrawPiece(state, playerIndex, cheapestUnitPosition);
  } else {
    await BoardJS.sellPiece(state, playerIndex, cheapestUnitPosition);
  }

  const newBoard = state.getIn(['players', playerIndex, 'board']);
  const level = state.getIn(['players', playerIndex, 'level']);
  if (newBoard.size > level) {
    await _mutateStateByFixingUnitLimit(state, playerIndex);
  }

  return true;
};

BoardJS.preBattleCheck = async function(state) {
  for (const uid in state.players) {
    const player = state.players[uid];
    if (Object.keys(player.board).length > player.level) {
      console.log('Before awaiting state mutation');
      await _mutateStateByFixingUnitLimit(state, uid);
      console.log('After awaiting state mutation');
    }
  }

  console.log('Returning state');
  return state;
};

module.exports = BoardJS;
