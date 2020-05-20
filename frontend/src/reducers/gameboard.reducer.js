export function gameboard(
  state = {
    isActiveBattleGoing: false, // Most battle checks
    actionStack: [], // active battle actions
    battleStartBoard: [], // game board on battle start
    myHand: [],
    myBoard: [],
    index: -1, // player index, but need to get rid of this
    isDead: false // get rid plx
  },
  action
) {
  switch (action.type) {
    case 'CUSTOMER_LOGIN_SUCCESS': {
      return {
        ...state,
        index: action.customer.index
      };
    }
    case 'START_BATTLE': {
      const { actionStack, startBoard } = action;
      return {
        ...state,
        isActiveBattleGoing: true,
        actionStack: actionStack,
        battleStartBoard: startBoard
      };
    }
    case 'UPDATED_STATE': {
      const player = action.newState.players.find(player => player.index === state.index);
      return {
        ...state,
        myHand: player.hand,
        myBoard: player.board,
        isActiveBattleGoing: false
      };
    }
    case 'UPDATE_PLAYER': {
      return {
        ...state,
        myHand: action.player.hand,
        myBoard: action.player.board
      };
    }
    default:
      return state;
  }
}
