export function gameboard(
  state = {
    isActiveBattleGoing: false, // Most battle checks
    actionStack: [], // active battle actions
    battleStartBoard: [], // game board on battle start
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
        isActiveBattleGoing: false
      };
    }
    default:
      return state;
  }
}
