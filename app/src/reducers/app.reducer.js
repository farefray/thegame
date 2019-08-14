import {
  getBackgroundAudio,
  getSoundEffect
} from '../audio';

const devMode = true;

const updateSoundArray = (array, pos, newSound) => {
  return array.map((item, index) => {
    if (index !== pos) {
      // This isn't the item we care about - keep it as-is
      return item;
    }
    // Otherwise, this is the one we want - return an updated value
    return newSound;
  })
}

const getNewSoundEffects = (soundEffects, newSoundEffect) => {
  for (let i = 0; i < soundEffects.length; i++) {
    if (soundEffects[i] !== newSoundEffect) {
      // Overwrites prev sound
      return updateSoundArray(soundEffects, i, newSoundEffect);
    }
  }
  /*
  // New - all playing at the same time - implementation
  for(let i = counter; i < soundEffects.length; i++){
    if(soundEffects[i] !== newSoundEffect){
      console.log('@NewSoundEffect', i, newSoundEffect, 'x', soundEffects[i]);
      increaseCounter(soundEffects);
      return updateSoundArray(soundEffects, i, newSoundEffect);
    }
  }
  console.log('@sound over 0')
  for(let i = 0; i < counter; i++){
    if(soundEffects[i] !== newSoundEffect){
      console.log('@NewSoundEffect', i, newSoundEffect, 'x', soundEffects[i]);
      increaseCounter(soundEffects);
      return updateSoundArray(soundEffects, i, newSoundEffect);
    }
  }*/
  return soundEffects;
}

const clearSoundEffect = (soundEffects, soundEffect) => {
  let newSoundEffects = soundEffects;
  for (let i = 0; i < soundEffects.length; i++) {
    if (soundEffects[i] === soundEffect) {
      // console.log('@NewSoundEffect', i, newSoundEffect)
      newSoundEffects[i] = '';
    }
  }
  return newSoundEffects;
}

const sumObj = (obj) => {
  let sum = 0;
  for (let el in obj) {
    if (obj.hasOwnProperty(el)) {
      sum += parseInt(obj[el], 10);
    }
  }
  return sum;
}

export function app(state = {
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
    myShop: {},
    lock: false,
    level: -1,
    exp: -1,
    expToReach: -1,
    gold: -1,
    isActiveBattleGoing: false, // Most battle checks
    isBattle: false, // Used for checking interactions before battle state is received
    enemyIndex: -1,
    roundType: '',
    startBattle: false,
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
    musicEnabled: true,
    soundEnabled: true,
    chatSoundEnabled: true,
    selectedSound: '',
    soundEffects: ['', '', '', '', '', '', '', '', '', ''],
    music: getBackgroundAudio('mainMenu'),
    volume: 0.05,
    isDead: true,
    selectedShopUnit: '',
    isSelectModeShop: false,
    boardBuffs: {},
    deadPlayers: [],
    unitJson: {},
    loadedUnitJson: false,
    visiting: -1,
    actionStack: {},
    battleStartBoards: {},
    winners: {},
    dmgBoards: {},
    showDmgBoard: false,
    dmgBoardTotalDmg: -1,
    markedBuff: '',
    displayMarkedBuff: false,
    prevDmgBoard: {},
    loadingCounter: 1,
  },
  action
) {
  let tempSoundEffects;
  if (devMode) {
    state = {
      ...state,
      musicEnabled: false,
      soundEnabled: false,
    } // Disallows testing sounds currently
  }
  switch (action.type) { // Listens to events dispatched from from socket.js    
    case 'WAITINGROOM_STATUS': {
      return {
        ...state,
        connectedPlayers: action.connectedPlayers,
        allReady: action.allReady,
        gameIsLive: false,
        music: getBackgroundAudio('mainMenu'),
      }
    }
    case 'NEW_STATE':
      // Update state with incoming data from server
      state = {
        ...state,
        message: 'Received State',
        messageMode: '',
        players: action.newState.players,
        round: action.newState.round,
        countdown: 15,
      };
      if (action.newState.players[state.index]) {
        state = {
          ...state,
          myHand: action.newState.players[state.index].hand,
          myBoard: action.newState.players[state.index].board,
          myShop: action.newState.players[state.index].shop,
          boardBuffs: action.newState.players[state.index].boardBuffs,
          level: action.newState.players[state.index].level,
          exp: action.newState.players[state.index].exp,
          expToReach: action.newState.players[state.index].expToReach,
          gold: action.newState.players[state.index].gold,
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
        allReady: false,
        message: 'default',
        messageMode: '',
        help: true,
        chatHelpMode: 'chat',
        chatMessages: [],
        senderMessages: [],
        lock: false,
        isActiveBattleGoing: false,
        enemyIndex: -1,
        startBattle: false,
        actionStack: {},
        battleStartBoard: {},
        winner: false,
        dmgBoard: {},
        selectedUnit: -1,
        soundEffects: ['', '', '', '', '', '', '', '', '', ''],
        music: getBackgroundAudio('idle'),
        isDead: false,
        boardBuffs: {},
        deadPlayers: [],
      }
    }
    case 'UPDATE_PLAYER':
      state = {
        ...state,
        // message: 'Updated player', 
        messageMode: '',
      }
      if (action.index === state.index && !state.isDead) {
        // TODO: Model upgrades on myBoard here
        state = {
          ...state,
          myShop: action.player.shop,
          level: action.player.level,
          exp: action.player.exp,
          expToReach: action.player.expToReach,
          gold: action.player.gold,
        };
      }
      if (state.visiting === action.index && action.index !== state.index) {
        if (state.isDead) { // Sync everything when dead
          state = {
            ...state,
            myShop: action.player.shop,
            level: action.player.level,
            exp: action.player.exp,
            expToReach: action.player.expToReach,
            gold: action.player.gold,
          }
        }
        state = {
          ...state,
          myHand: action.player.hand,
          myBoard: action.player.board,
          boardBuffs: action.player.boardBuffs,
        }
      } else if (action.index === state.index && !state.isDead) {
        state = {
          ...state,
          visiting: state.index,
          myHand: action.player.hand,
          myBoard: action.player.board,
          boardBuffs: action.player.boardBuffs,
        }
      }

      const players = state.players;
      players[action.index] = action.player
      state = {
        ...state,
        players: {
          ...players
        }
      }
      break;
    case 'LOCK_TOGGLED':
      state = {
        ...state,
        lock: action.lock
      }
      break;
    case 'UPDATE_MESSAGE':
      state = {
        ...state,
        message: action.message,
        messageMode: action.messageMode
      }
      break;
    case 'TOGGLE_HELP':
      state = {
        ...state,
        help: !state.help
      }
      break;
    case 'SET_HELP_MODE':
      state = {
        ...state,
        chatHelpMode: action.chatHelpMode,
        showDmgBoard: false
      }
      break;
    case 'BATTLE_TIME':
      const actionStack = action.actionStack[state.index];
      const battleStartBoard = action.battleStartBoards[state.index];
      const winner = false; // TODO action.winners[state.index];
      if (!state.musicEnabled) {
        tempSoundEffects = getNewSoundEffects(state.soundEffects, getSoundEffect('horn'));
        state = {
          ...state,
          soundEffects: tempSoundEffects
        }
      }
      state = {
        ...state,
        music: (action.enemy ? getBackgroundAudio('pvpbattle') : getBackgroundAudio('battle')),
        isActiveBattleGoing: true,
        startBattle: true,
        actionStack: action.actionStack,
        battleStartBoard: action.battleStartBoards,
        winners: action.winners,
      }
      if (!state.isDead) {
        state = {
          ...state,
          actionStack,
          battleStartBoard,
          winner
        }
      } else if (state.visiting !== state.index && action.battleStartBoards[state.visiting]) {
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
      }
      // TODO: BattleStartBoard contain unneccessary amount of information
      break;
    case 'CHANGE_STARTBATTLE':
      state = {
        ...state,
        startBattle: action.value
      }
      break;
    case 'UPDATE_BATTLEBOARD': {
      state = {
        ...state,
        battleStartBoard: action.board,
        message: 'Move ' + action.moveNumber,
        messageMode: ''
      }
      break;
    }
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
      }
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
        }
      } else {
        state = {
          ...state,
          selectedUnit: action.selectedUnit,
          isSelectModeShop: false
        }
      }
      break;
    case 'SELECT_SHOP_INFO':
      state = {
        ...state,
        selectedShopUnit: action.name,
        isSelectModeShop: true
      }
      break;
    case 'SET_ONGOING_BATTLE': { // not used, so check
      state = {
        ...state,
        isActiveBattleGoing: action.value
      }
      break;
    }
    case 'DEACTIVATE_INTERACTIONS': {
      state = {
        ...state,
        isBattle: true
      }
      break;
    }
    case 'END_BATTLE': {
      state = {
        ...state,
        isActiveBattleGoing: false,
        round: state.round + 1,
        music: getBackgroundAudio('idle'),
        showDmgBoard: true,
        roundType: action.upcomingRoundType,
        enemyIndex: (action.upcomingGymLeader || ''),
        isBattle: false
      }
      break;
    }
    case 'CLEAR_TICKS': {
      const tempSoundEffects = clearSoundEffect(state.soundEffects, getSoundEffect('Tick'));
      state = {
        ...state,
        soundEffects: tempSoundEffects
      };
      break;
    }
    case 'TOGGLE_SHOW_DMGBOARD': {
      state = {
        ...state,
        showDmgBoard: false
      }
      break;
    }
    case 'TOGGLE_MUSIC':
      state = {
        ...state,
        musicEnabled: !state.musicEnabled
      }
      break;
    case 'TOGGLE_SOUND':
      state = {
        ...state,
        soundEnabled: !state.soundEnabled
      }
      break;
    case 'TOGGLE_CHAT_SOUND':
      state = {
        ...state,
        chatSoundEnabled: !state.chatSoundEnabled
      }
      break;
    case 'CHANGE_VOLUME':
      state = {
        ...state,
        volume: action.newVolume
      }; //, music: state.music}
      break;
    case 'NEW_UNIT_SOUND':
      state = {
        ...state,
        selectedSound: action.newAudio
      }
      break;
    case 'NEW_SOUND_EFFECT':
      tempSoundEffects = getNewSoundEffects(state.soundEffects, action.newSoundEffect);
      state = {
        ...state,
        soundEffects: tempSoundEffects
      };
      break;
    case 'END_GAME': {
      let newMusic = state.music;
      if (state.index === action.winningPlayer.index) {
        newMusic = getBackgroundAudio('wonGame')
      }
      console.log('Remaining keys in players ...', Object.keys(state.players));
      Object.keys(state.players).forEach((key) => {
        if (key !== action.winningPlayer.index) {
          console.log('Deleting key ...', key, state.players)
          delete state.players[key];
        }
      });
      const {
        senderMessages,
        chatMessages
      } = state;
      state = {
        ...state,
        message: state.players[action.winningPlayer.index].name + ' won the game',
        messageMode: 'big',
        gameEnded: action.winningPlayer,
        music: newMusic,
        senderMessages: senderMessages.concat(state.players[action.winningPlayer.index].name + ' won the game'),
        chatMessages: chatMessages.concat(''),
      }
      break;
    }
    case 'DEAD_PLAYER': {
      if (action.pid === state.index) {
        state = {
          ...state,
          message: 'You Lost! You finished ' + action.position + '!',
          messageMode: 'big',
          isDead: true
        }
      }
      if (state.isDead && state.visiting === action.pid) {
        state = {
          ...state,
          visiting: state.index
        }
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
      }
      console.log('reducer.Dead_player', state.deadPlayers, deadPlayers);
      break;
    }
    case 'NEW_CHAT_MESSAGE':
      const {
        senderMessages, chatMessages
      } = state;
      state = {
        ...state,
        senderMessages: senderMessages.concat(action.senderMessage),
        chatMessages: chatMessages.concat(action.newMessage)
      };
      let soundEffect;
      switch (action.chatType) {
        case 'pieceUpgrade':
          soundEffect = getSoundEffect('lvlup');
          break;
        case 'playerEliminated':
        case 'disconnect':
          soundEffect = getSoundEffect('disconnect');
          break;
        case 'chat':
        default:
          soundEffect = getSoundEffect('pling');
      }
      tempSoundEffects = getNewSoundEffects(state.soundEffects, soundEffect);
      state = {
        ...state,
        soundEffects: tempSoundEffects
      };
      break;
    case 'SPEC_PLAYER': {
      const index = action.playerIndex;
      state = {
        ...state,
        visiting: index,
        myHand: state.players[index].hand,
        myBoard: state.players[index].board,
        boardBuffs: state.players[index].boardBuffs,
        /*
          Requires redo logic of battle / how actionStack are stored to jump between battles
          battleStartBoard: state.battleStartBoards[index],
          actionMove: state.actionMoves[index],
          winners: state.winner[index],
        */
      }
      break;
    }
    case 'SET_MARKED_BUFF': {
      if (state.markedBuff === action.buff) {
        state = {
          ...state,
          displayMarkedBuff: !state.displayMarkedBuff
        }
      } else {
        state = {
          ...state,
          markedBuff: action.buff,
          displayMarkedBuff: true
        }
      }
      break;
    }
    case 'TOGGLE_DISPLAY_MARKED_BUFF': {
      state = {
        ...state,
        displayMarkedBuff: !state.displayMarkedBuff
      }
      break;
    }
    case 'LOADING_STRING': {
      if (!state.startscreen || !(state.startscreen.connected)) {
        state = {
          ...state,
          loadingCounter: action.loadingCounter
        }
      }
      break;
    }
    default:
      break;
  }
  return state;
};