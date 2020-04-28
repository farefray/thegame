import Player from '../objects/Player';
import State from '../objects/State';
import AppError from '../objects/AppError';
import AiPlayer from '../models/AiPlayer';

const HAND_UNITS_LIMIT = 9;

const GameController = {
  purchasePawn: async (state, playerIndex, pieceIndex) => {
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
  },
};


export default GameController;
