export function gameboard(
  state = {
    isActiveBattleGoing: false, // Most battle checks
    actionStack: [], // active battle actions
    battleStartBoard: [], // game board on battle start
    isDead: false // get rid plx
  },
  action
) {
  switch (action.type) {
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
      return {
        ...state,
        isActiveBattleGoing: false
      };
    }
    default:
      return state;
  }
}
