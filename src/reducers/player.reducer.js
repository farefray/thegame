const basePlayerState = {
  health: 100,
  gold: -1,
  boardUnits: [],

  hand: [],
  deck: [],
  discard: []
};

export default function player(state = basePlayerState, action) {
  switch (action.type) {
    case 'UPDATE_PLAYER':
      const { player } = action;
      return state = {
        ...state,
        gold: action.player.gold,
        boardUnits: action.player.board,
        health: action.player.health,

        discard: player.discard,
        deck: player.deck,
        hand: player.hand
    }
    default:
      return state
  }
}