
const f = require('../f');
const pawns = require('../pawns');

const BoardController = () => {
  return this;
};

/** Private methods */

/**
 * Checks all units on board for player of that piece type
 * if 3 units are found, remove those 3 units and replace @ position with evolution
 * No units are added to discardedPieces
 */
async function _checkPieceUpgrade(board, playerIndex, piece, position) {
  const todo = true;
  if (todo) {
    return {
      board,
      upgradeOccured: false
    };
  }
}

/** Public methods */


/**
 * Get first available spot on hand
 */
BoardController.getFirstAvailableSpot = async (state, playerIndex) => {
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
BoardController.withdrawPiece = async (state, playerIndex, piecePosition) => {
  const benchPosition = await BoardController.getFirstAvailableSpot(state, playerIndex);
  // TODO: Handle placePiece return upgradeOccured
  await BoardController.mutateStateByPawnPlacing(state, playerIndex, piecePosition, benchPosition, false);
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
BoardController.mutateStateByPawnPlacing = async (state, playerIndex, fromPosition, toPosition, shouldSwap = 'true') => {
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
BoardController.discardBaseUnits = async (stateParam, playerIndex, name, depth = 1) => {
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
  return BoardController.discardBaseUnits(state, playerIndex, newName, depth + 1);
};

/**
 * Sell piece
 * Increase money for player
 * Remove piece from position
 * add piece to discarded pieces
 */
BoardController.sellPiece = async (state, playerIndex, piecePosition) => {
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
  return BoardController.discardBaseUnits(newState, playerIndex, piece.get('name'));
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
    await BoardController.withdrawPiece(state, playerIndex, cheapestUnitPosition);
  } else {
    await BoardController.sellPiece(state, playerIndex, cheapestUnitPosition);
  }

  const newBoard = state.getIn(['players', playerIndex, 'board']);
  const level = state.getIn(['players', playerIndex, 'level']);
  if (newBoard.size > level) {
    await _mutateStateByFixingUnitLimit(state, playerIndex);
  }

  return true;
};

BoardController.preBattleCheck = async function(state) {
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

export default BoardController;
