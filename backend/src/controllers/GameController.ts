import Player from '../objects/Player';
import ShopController from './ShopController';
import State from '../objects/State';
import AppError from '../objects/AppError';
import AiPlayer from '../models/AiPlayer';

const HAND_UNITS_LIMIT = 9;

const GameController = function() {
  return this;
};

/**
 *
 * @todo errors handling
 * @param {*} state
 * @param {*} playerIndex
 * @param {*} pieceIndex
 * @returns {null||Object}
 */
GameController.purchasePawn = async (state, playerIndex, pieceIndex) => {
  const player = state.getIn(['players', playerIndex]);
  if (player.isDead()) {
    return new AppError('warning', "Sorry, you're already dead");
  }

  /**
   * Checks to be done:
   * unit exist in shop
   * hand is not full
   * can afford
   */
  const unit = player.shopUnits[pieceIndex];
  if (!unit || Object.keys(player.hand) >= HAND_UNITS_LIMIT) {
    return new AppError('warning', 'Your hand is full');
  }

  if (player.gold < unit.cost) {
    return new AppError('warning', 'Not enough money');
  }

  /**
   * remove unit from shop
   * add unit to hand
   * remove gold
   * set player state
   */
  await player.addToHand(unit.name);
  delete player.shopUnits[pieceIndex];
  player.gold -= unit.cost;

  state.setIn(['players', playerIndex], player);
  return state;
};

GameController.initializeState = async (clients, playersMinimum = 0) => {
  const playersArray = [];
  clients.forEach(client => {
    playersArray.push(new Player(client));
  });

  // we need to have pairs, so fill rest of spots as AI
  while (playersArray.length < playersMinimum || playersArray.length % 2 > 0) {
    playersArray.push(new AiPlayer(`ai_player_${playersArray.length}`));
  }

  const state = new State(playersArray);
  ShopController.mutateStateByShopRefreshing(state);
  return state;
};

export default GameController;
