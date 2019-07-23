import GameBoard from '../src/App/ActiveGame/GameBoard.jsx';

import './css/grid.css';
import './App.scss';
import './animations.css';
var state = {};

export default {
    component: GameBoard,
    props: {
        gameIsLive: state.gameIsLive,
        connected: state.connected,
        index: state.index,
        ready: state.ready,
        playersReady: state.playersReady,
        connectedPlayers: state.connectedPlayers,
        allReady: state.allReady,
        message: state.message,
        messageMode: state.messageMode,
        playerName: state.playerName,
        help: state.help,
        chatHelpMode: state.chatHelpMode,
        senderMessages: state.senderMessages,
        chatMessages: state.chatMessages,
        storedState: {
            amountOfPlayers: 1,
            income_basic: 1,
            round: 1,
            players: [{
                board: [],
                buff: Array(0),
                displayName: "Minotaur★",
                name: "minotaur",
                position: "2,0",
                type: "normal",
                exp: 0,
                expToReach: 1,
                gold: 9996,
                hand: {
                    hp: 50,
                    index: "0",
                    level: 5,
                    name: "asd",
                    rivals: {},
                },
                shop: [{
                    cost: 4,
                    displayName: "Minotaur★",
                    name: "minotaur",
                    type: "normal",
                }, {
                    cost: 4,
                    displayName: "Minotaur★",
                    name: "minotaur",
                    type: "normal",
                }, {
                    cost: 4,
                    displayName: "Minotaur★",
                    name: "minotaur",
                    type: "normal",
                }]
            }],
            players: state.players,
            player: state.player,
            myHand: state.myHand,
            myBoard: state.myBoard,
            myShop: state.myShop,
            lock: state.lock,
            level: state.level,
            exp: state.exp,
            expToReach: state.expToReach,
            gold: state.gold,
            onGoingBattle: state.onGoingBattle,
            isBattle: state.isBattle,
            enemyIndex: state.enemyIndex,
            roundType: state.roundType,
            startBattle: state.startBattle,
            actionStack: state.actionStack,
            battleStartBoard: state.battleStartBoard,
            winner: true,
            dmgBoard: state.dmgBoard,
            selectedUnit: state.selectedUnit,
            mouseOverId: state.mouseOverId,
            stats: state.stats,
            statsMap: state.statsMap,
            typeStatsString: "todo typeStatsString",
            typeBonusString: "state.typeBonusString",
            typeMap: {},
            musicEnabled: state.musicEnabled,
            soundEnabled: state.soundEnabled,
            chatSoundEnabled: state.chatSoundEnabled,
            selectedSound: state.selectedSound,
            soundEffect: state.soundEffect,
            soundEffects: state.soundEffects,
            music: state.music,
            volume: 0.05,
            startTimer: state.startTimer,
            isDead: state.isDead,
            selectedShopUnit: state.selectedShopUnit,
            isSelectModeShop: state.isSelectModeShop,
            boardBuffs: state.boardBuffs,
            deadPlayers: state.deadPlayers,
            gameEnded: state.gameEnded,
            pokemonSprites: state.pokemonSprites,
            unitJson: {},
            loadedUnitJson: state.loadedUnitJson,
            alternateAnimation: state.alternateAnimation,
            loaded: state.loaded,
            visiting: "0",
            showDmgBoard: state.showDmgBoard,
            timerDuration: 150,
            dmgBoardTotalDmg: state.dmgBoardTotalDmg,
            markedBuff: state.markedBuff,
            displayMarkedBuff: state.displayMarkedBuff,
            debugMode: state.debugMode,
            prevDmgBoard: state.prevDmgBoard,
            loadingCounter: state.loadingCounter,
        }
    }
};