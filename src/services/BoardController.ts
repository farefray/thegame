
import Position from '../../../frontend/src/shared/Position';

const BoardController = function () {
  return this;
};

/**
 * Get first available spot on hand
 */
BoardController.getFirstAvailableSpot = async (state, playerIndex) => {
  const hand = state.getIn(['players', playerIndex, 'hand']);
  const myHandY = '-1';
  for (let x = 0; x < 8; x++) {
    const pos = new Position(x, myHandY); // performance wise better to concatenate strings here
    if (hand[pos.toString()]) {
      return pos;
    }
  }

  return undefined;
};

/**
 * WithdrawPiece from board to best spot on bench
 * Assumes not bench is full (todo?)
 */
BoardController.withdrawPiece = async (state, playerIndex, piecePosition) => {
  const benchPosition = await BoardController.getFirstAvailableSpot(state, playerIndex);
  await BoardController.mutateStateByPawnPlacing(state, playerIndex, piecePosition, benchPosition, false);
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
BoardController.mutateStateByPawnPlacing = async (state, playerIndex, fromBoardPosition, toBoardPosition, shouldSwap = true) => {
  const fromPosition = new Position(fromBoardPosition);
  const toPosition = new Position(toBoardPosition);
  const hand = state.getIn(['players', playerIndex, 'hand']);
  const board = state.getIn(['players', playerIndex, 'board']);

  let battleUnit;
  // remove from old position
  if (fromPosition.isMyHandPosition()) {
    battleUnit = hand[fromBoardPosition];
    delete hand[fromBoardPosition];
  } else {
    battleUnit = board[fromBoardPosition];
    delete board[fromBoardPosition];
  }

  battleUnit.rearrange(toPosition)

  let unitToSwap;
  // place on new position
  if (toPosition.isMyHandPosition()) {
    unitToSwap = hand[toBoardPosition];
    hand[toBoardPosition] = battleUnit;
  } else {
    unitToSwap = board[toBoardPosition];
    board[toBoardPosition] = battleUnit;
  }

  if (shouldSwap && !!unitToSwap) {
    unitToSwap.rearrange(fromPosition)

    if (fromPosition.isMyHandPosition()) {
      hand[fromBoardPosition] = unitToSwap;
    } else {
      board[fromBoardPosition] = unitToSwap;
    }
  }

  state.setIn(['players', playerIndex, 'hand'], hand);
  state.setIn(['players', playerIndex, 'board'], board);
};


/**
 * @function
 * @description
 * Sell piece
 * Increase money for player
 * Remove piece from position
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

export default BoardController;
