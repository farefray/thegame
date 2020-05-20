const basePlayerState = {
  index: 0, // revise
  health: 100,
  mana: 0,
  level: -1,
  exp: -1,
  expToReach: -1,
  gold: -1,
  shopUnits: []
};

export default function player(state = basePlayerState, action) {
  switch (action.type) {
    case 'CUSTOMER_LOGIN_SUCCESS': {
      return {
        ...state,
        index: action.customer.index
      };
    }
    case 'UPDATE_PLAYER':
      return state = {
        ...state,
        level: action.player.level,
        exp: action.player.exp,
        expToReach: action.player.expToReach,
        gold: action.player.gold,
        shopUnits: action.player.shopUnits
    }
    case 'UPDATED_STATE':
      return {
        ...state,
        shopUnits: action.newState.players[state.index].shopUnits,
        level: action.newState.players[state.index].level,
        exp: action.newState.players[state.index].exp,
        expToReach: action.newState.players[state.index].expToReach,
        gold: action.newState.players[state.index].gold,
        health: action.newState.players[state.index].health,
        mana: action.newState.players[state.index].mana
      };
    default:
      return state
  }
}