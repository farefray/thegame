import Monsters from '../utils/Monsters';

const ShopController = () => {
  return this;
};

const SHOP_UNITS = 4;
/**
 * Refresh shop
 * Generate newShop from pieces and update pieces to newPieces
 * Update discarded cards from previous shop
 * Add new shop
 * TODO: Add logic for piece cap, max 9 units
 * @param {State} state
 * @param {String} playerIndex [optional]
 */
ShopController.mutateStateByShopRefreshing = (state, playerIndex) => {
  if (!playerIndex) {
    // go for all players in state
    const players = state.get('players');
    for (const uid in players) {
      ShopController.mutateStateByShopRefreshing(state, uid);
    }
  } else {
    const player = state.getIn(['players', playerIndex]);
    const shop = player.get('shopUnits');
    for (let i = 0; i <= SHOP_UNITS; i++) {
      state.setIn(['players', playerIndex, 'shopUnits', i], Monsters.getRandomUnit({
        cost: state.get('round')
      }));
    }
  }
};

export default ShopController;