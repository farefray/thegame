const basePlayerState = {
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
    case 'UPDATE_PLAYER':
      return state = {
        ...state,
        level: action.player.level,
        exp: action.player.exp,
        expToReach: action.player.expToReach,
        gold: action.player.gold,
        shopUnits: action.player.shopUnits
    };
    default:
      return state
  }
}