const basePlayerState = {
  index: -1, // revise
  hp: 100,
  mana: 0,
  level: -1,
  exp: -1,
  expToReach: -1,
  gold: -1,
  shopUnits: {}
};

export default function player(state = basePlayerState, action) {
  switch (action.type) {
    case 'INITIALIZE': {
      return {
        ...state,
        index: action.index
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
      };
    default:
      return state
  }
}