export function gameboard(
  state = {
    isActiveBattleGoing: false, // Most battle checks
    actionStack: [], // active battle actions
    battleStartBoard: {}, // game board on battle start
    myHand: {},
    myBoard: {},
    index: -1, // player index, but need to get rid of this
    isDead: false, // get rid plx
  },
  action
) {
  switch (action.type) {
    case 'ADD_PLAYER': {
      return {
        ...state,
        index: action.index
      };
    }
    case 'BATTLE_TIME': {
      const { actionStack, startBoard } = action;
      return {
        ...state,
        isActiveBattleGoing: true,
        actionStack: actionStack,
        battleStartBoard: startBoard
      };
    }
    case 'SET_ONGOING_BATTLE': {
      return {
        ...state,
        isActiveBattleGoing: action.value
      };
    }
    case 'END_BATTLE': {
      return {
        ...state,
        isActiveBattleGoing: false,
        round: state.round + 1,
        roundType: action.upcomingRoundType,
        enemyIndex: action.upcomingGymLeader || ''
      };
    }
    case 'UPDATED_STATE': {
      return {
        ...state,
        myHand: action.newState.players[state.index].hand,
        myBoard: action.newState.players[state.index].board
      };
    }
    case 'UPDATE_PLAYER': {
      return {
        ...state,
        myHand: action.player.hand,
        myBoard: action.player.board,
      };
    }
    default:
      return state;
  }
}
