export function app(
  state = {
    gameIsLive: false,
    index: -1,
    message: 'default',
    messageMode: '',
    help: true,
    chatHelpMode: 'chat',
    chatMessages: [],
    senderMessages: [],
    players: {},
    myHand: {},
    myBoard: {},
    shopUnits: {},
    lock: false,
    level: -1,
    exp: -1,
    expToReach: -1,
    gold: -1,
    isActiveBattleGoing: false, // Most battle checks
    isBattle: false, // Used for checking interactions before battle state is received
    enemyIndex: -1,
    roundType: '',
    actionStack: {},
    battleStartBoard: {},
    winner: false,
    dmgBoard: {},
    selectedUnit: -1,
    mouseOverId: -1,
    stats: {},
    statsMap: {},
    typeStatsString: '',
    typeBonusString: '',
    round: 1,
    isDead: true,
    selectedShopUnit: '',
    isSelectModeShop: false,
    boardBuffs: {},
    deadPlayers: [],
    unitJson: {},
    loadedUnitJson: false,
    visiting: -1,
    battleStartBoards: {},
    winners: {},
    dmgBoards: {},
    showDmgBoard: false,
    dmgBoardTotalDmg: -1,
    markedBuff: '',
    displayMarkedBuff: false,
    prevDmgBoard: {}
  },
  action
) {
  switch (action.type) {
    case 'INIT': {
      // Used for cosmos fixtures
      state.isDead = false;
      state.countdown = 15;
      return {
        ...state
      };
    }
    case 'DEBUG': {
      // Used for cosmos debugging
      console.log(action);
      return {
        ...action.newState.app
      };
    }
    case 'UPDATED_STATE':
      // Update state with incoming data from server
      state = {
        ...state,
        message: 'Received State',
        messageMode: '',
        players: action.newState.players,
        round: action.newState.round,
        countdown: 10
      };
      if (action.newState.players[state.index]) {
        state = {
          ...state,
          myHand: action.newState.players[state.index].hand,
          myBoard: action.newState.players[state.index].board,
          shopUnits: action.newState.players[state.index].shopUnits,
          boardBuffs: action.newState.players[state.index].boardBuffs,
          level: action.newState.players[state.index].level,
          exp: action.newState.players[state.index].exp,
          expToReach: action.newState.players[state.index].expToReach,
          gold: action.newState.players[state.index].gold
          // lock: action.newState.players[state.index].lock,
        };
      }
      break;
    case 'ADD_PLAYER': {
      return {
        ...state,
        index: action.index,
        visiting: action.index,
        gameIsLive: true,
        connectedPlayers: -1,
        message: 'default',
        messageMode: '',
        help: true,
        chatHelpMode: 'chat',
        chatMessages: [],
        senderMessages: [],
        lock: false,
        isActiveBattleGoing: false,
        enemyIndex: -1,
        actionStack: {},
        battleStartBoard: {},
        winner: false,
        dmgBoard: {},
        selectedUnit: -1,
        isDead: false,
        boardBuffs: {},
        deadPlayers: []
      };
    }
    case 'UPDATE_PLAYER':
      state = {
        ...state,
        // message: 'Updated player',
        messageMode: ''
      };
      if (action.index === state.index && !state.isDead) {
        // TODO: Model upgrades on myBoard here
        state = {
          ...state,
          shopUnits: action.player.shopUnits,
          level: action.player.level,
          exp: action.player.exp,
          expToReach: action.player.expToReach,
          gold: action.player.gold
        };
      }
      if (state.visiting === action.index && action.index !== state.index) {
        if (state.isDead) {
          // Sync everything when dead
          state = {
            ...state,
            shopUnits: action.player.shopUnits,
            level: action.player.level,
            exp: action.player.exp,
            expToReach: action.player.expToReach,
            gold: action.player.gold
          };
        }
        state = {
          ...state,
          myHand: action.player.hand,
          myBoard: action.player.board,
          boardBuffs: action.player.boardBuffs
        };
      } else if (action.index === state.index && !state.isDead) {
        state = {
          ...state,
          visiting: state.index,
          myHand: action.player.hand,
          myBoard: action.player.board,
          boardBuffs: action.player.boardBuffs
        };
      }

      const players = state.players;
      players[action.index] = action.player;
      state = {
        ...state,
        players: {
          ...players
        }
      };
      break;
    case 'LOCK_TOGGLED':
      state = {
        ...state,
        lock: action.lock
      };
      break;
    case 'UPDATE_MESSAGE':
      state = {
        ...state,
        message: action.message,
        messageMode: action.messageMode
      };
      break;
    case 'TOGGLE_HELP':
      state = {
        ...state,
        help: !state.help
      };
      break;
    case 'SET_HELP_MODE':
      state = {
        ...state,
        chatHelpMode: action.chatHelpMode,
        showDmgBoard: false
      };
      break;
    case 'BATTLE_TIME':
      //console.log('TCL: action', action);
      const { actionStack, startBoard, winner } = action;
      state = {
        ...state,
        isActiveBattleGoing: true,
        actionStack: actionStack,
        battleStartBoard: startBoard,
        winners: winner
      };
      //console.log('TCL: state', state);

      // visiting will be kicked from game
      /* if (state.visiting !== state.index && action.battleStartBoards[state.visiting]) {
        const actionStackVisit = action.actionStack[state.visiting];
        const battleStartBoardVisit = action.battleStartBoards[state.visiting];
        const winnerVisit = action.winners[state.visiting];
        const dmgBoardVisit = action.dmgBoards[state.visiting];
        state = {
          ...state,
          actionStack: actionStackVisit,
          battleStartBoard: battleStartBoardVisit,
          winner: winnerVisit,
          dmgBoard: dmgBoardVisit,
          dmgBoardTotalDmg: sumObj(dmgBoardVisit),
        }
      } */
      // TODO: BattleStartBoard contain unneccessary amount of information
      break;
    /*
      case 'RESET_BATTLEBOARD_ACTIONMESSAGE': {
        const battleBoard = state.battleStartBoard;
        if(battleBoard[action.id]) battleBoard[action.id].actionMessage = '';
        state = {...state, battleStartBoard: battleBoard}
      }*/
    case 'SET_STATS':
      const statsMap = state.statsMap;
      statsMap[action.name] = action.stats;
      state = {
        ...state,
        name: action.name,
        stats: action.stats,
        statsMap: statsMap
      };
      break;
    case 'SELECT_UNIT':
      if (action.selectedUnit === '') {
        const selectedUnit = state.selectedUnit;
        selectedUnit['displaySell'] = false;
        // selectedUnit['pos'] = '';
        state = {
          ...state,
          selectedUnit: {
            ...selectedUnit
          }
        };
      } else {
        state = {
          ...state,
          selectedUnit: action.selectedUnit,
          isSelectModeShop: false
        };
      }
      break;
    case 'SELECT_SHOP_INFO':
      state = {
        ...state,
        selectedShopUnit: action.name,
        isSelectModeShop: true
      };
      break;
    case 'SET_ONGOING_BATTLE': {
      state = {
        ...state,
        isActiveBattleGoing: action.value,
        countdown: action.countdown
      };
      break;
    }
    case 'DEACTIVATE_INTERACTIONS': {
      state = {
        ...state,
        isBattle: true
      };
      break;
    }
    case 'END_BATTLE': {
      state = {
        ...state,
        isActiveBattleGoing: false,
        round: state.round + 1,
        showDmgBoard: true,
        roundType: action.upcomingRoundType,
        enemyIndex: action.upcomingGymLeader || '',
        isBattle: false
      };
      break;
    }
    case 'TOGGLE_SHOW_DMGBOARD': {
      state = {
        ...state,
        showDmgBoard: false
      };
      break;
    }
    case 'END_GAME': {
      console.log('Remaining keys in players ...', Object.keys(state.players));
      Object.keys(state.players).forEach(key => {
        if (key !== action.winningPlayer) {
          console.log('Deleting key ...', key, state.players);
          delete state.players[key];
        }
      });
      const { senderMessages, chatMessages } = state;
      state = {
        ...state,
        message: state.players[action.winningPlayer].name + ' won the game',
        messageMode: 'big',
        gameEnded: action.winningPlayer,
        senderMessages: senderMessages.concat(state.players[action.winningPlayer].name + ' won the game'),
        chatMessages: chatMessages.concat('')
      };
      break;
    }
    case 'DEAD_PLAYER': {
      if (action.pid === state.index) {
        state = {
          ...state,
          message: 'You Lost! You finished ' + action.position + '!',
          messageMode: 'big',
          isDead: true
        };
      }
      if (state.isDead && state.visiting === action.pid) {
        state = {
          ...state,
          visiting: state.index
        };
      }
      console.log('Before: Removing player ' + action.pid, state.players);
      const players = state.players;
      const deadPlayer = {
        index: action.pid,
        hp: 0,
        pos: state.position,
        name: players[action.pid].name
      };
      delete players[action.pid];
      console.log('Removing player ' + action.pid, players, state.players);
      const deadPlayers = state.deadPlayers;
      deadPlayers.push(deadPlayer);
      state = {
        ...state,
        deadPlayers,
        players
      };
      console.log('reducer.Dead_player', state.deadPlayers, deadPlayers);
      break;
    }
    case 'NEW_CHAT_MESSAGE':
      const { senderMessages, chatMessages } = state;
      state = {
        ...state,
        senderMessages: senderMessages.concat(action.senderMessage),
        chatMessages: chatMessages.concat(action.newMessage)
      };
      break;
    case 'SPEC_PLAYER': {
      const index = action.playerIndex;
      state = {
        ...state,
        visiting: index,
        myHand: state.players[index].hand,
        myBoard: state.players[index].board,
        boardBuffs: state.players[index].boardBuffs
        /*
          Requires redo logic of battle / how actionStack are stored to jump between battles
          battleStartBoard: state.battleStartBoards[index],
          actionMove: state.actionMoves[index],
          winners: state.winner[index],
        */
      };
      break;
    }
    case 'SET_MARKED_BUFF': {
      if (state.markedBuff === action.buff) {
        state = {
          ...state,
          displayMarkedBuff: !state.displayMarkedBuff
        };
      } else {
        state = {
          ...state,
          markedBuff: action.buff,
          displayMarkedBuff: true
        };
      }
      break;
    }
    case 'TOGGLE_DISPLAY_MARKED_BUFF': {
      state = {
        ...state,
        displayMarkedBuff: !state.displayMarkedBuff
      };
      break;
    }
    default:
      break;
  }
  return state;
}
