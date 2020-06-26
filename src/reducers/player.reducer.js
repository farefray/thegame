const basePlayerState = {
  health: 100,
  mana: 0,
  level: -1,
  gold: -1,
  handUnits: [],
  boardUnits: []
};

export default function player(state = basePlayerState, action) {
  switch (action.type) {
    case 'UPDATE_PLAYER':
      return state = {
        ...state,
        level: action.player.level,
        gold: action.player.gold,
        handUnits: action.player.hand,
        boardUnits: action.player.board,
        health: action.player.health
    }
    default:
      return state
  }
}