
import Position from '../../app/src/objects/Position';

const f = require('../f');
const pawns = require('../pawns');

const BoardController = () => {
  return this;
};

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
 * * Assumes not bench is full (todo?)
 */
BoardController.withdrawPiece = async (state, playerIndex, piecePosition) => {
  const benchPosition = await BoardController.getFirstAvailableSpot(state, playerIndex);
  // TODO: Handle placePiece return upgradeOccured
  await BoardController.mutateStateByPawnPlacing(state, playerIndex, piecePosition, benchPosition, false);
  return true;
};

/**
 * @function
 * @description
 * Assumes that only half of the board is placed on
 * TODO: Mark units to be sent back if too many
 *       Do buff calculations and mark on board
 * @param {State} state @mutable
 * @param {String} playerIndex
 * @param {BoardPosition} fromBoardPosition
 * @param {BoardPosition} toBoardPosition
 * @param {Boolean} shouldSwap @default true Swap functionality by default, if something is there already
 */
BoardController.mutateStateByPawnPlacing = async (state, playerIndex, fromBoardPosition, toBoardPosition, shouldSwap = 'true') => {
  const fromPosition = new Position(fromBoardPosition);
  const toPosition = new Position(toBoardPosition);
  const hand = state.getIn(['players', playerIndex, 'hand']);
  const board = state.getIn(['players', playerIndex, 'board']);

  let piece;
  // Update pawns positions and remove from old stores based on fromPosition
  if (fromPosition.isMyHandPosition()) {
    // TODO some unit.Move()
    piece = hand[fromBoardPosition];
    hand[fromBoardPosition].position = toPosition;
    // also consider using only position, not .x and .y
    hand[fromBoardPosition].x = toPosition.x;
    hand[fromBoardPosition].y = toPosition.y;
    delete hand[fromBoardPosition];
  } else {
    piece = board[fromBoardPosition];
    board[fromBoardPosition].position = toPosition;
    board[fromBoardPosition].x = toPosition.x;
    board[fromBoardPosition].y = toPosition.y;
    delete board[fromBoardPosition];
  }

  let newPiece;
  if (toPosition.isMyHandPosition()) {
    newPiece = hand[toBoardPosition];
    hand[toBoardPosition] = piece;
  } else {
    newPiece = board[toBoardPosition];
    board[toBoardPosition] = piece;
  }

  // TODO
  if (shouldSwap && !!newPiece) {
    newPiece.position = fromPosition;

    if (fromPosition.isMyHandPosition()) {
      hand[fromBoardPosition] = newPiece;
    } else {
      board[fromBoardPosition] = newPiece;
    }
  }

  state.setIn(['players', playerIndex, 'hand'], hand);
  state.setIn(['players', playerIndex, 'board'], board);
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
 * @function
 * @description
 * Sell piece
 * Increase money for player
 * Remove piece from position
 * add piece to discarded pieces
 * @param {State} state @mutable
 * @param {String} playerIndex
 * @param {BoardPosition} fromBoardPosition
 */
BoardController.mutateStateByPawnSelling = async (state, playerIndex, fromBoardPosition) => {
  const fromPosition = new Position(fromBoardPosition);
  const piece = fromPosition.isMyHandPosition()
    ? state.getIn(['players', playerIndex, 'hand', fromBoardPosition])
    : state.getIn(['players', playerIndex, 'board', fromBoardPosition]);

  const cost = piece.cost;
  const gold = state.getIn(['players', playerIndex, 'gold']);
  state.setIn(['players', playerIndex, 'gold'], +gold + +cost);

  if (fromPosition.isMyHandPosition()) {
    state.deleteIn(['players', playerIndex, 'hand', fromBoardPosition]);
  } else {
    state.deleteIn(['players', playerIndex, 'board', fromBoardPosition]);
  }
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

  return state;
};

export default BoardController;
