

import React, { Component } from 'react';
import { sendMessage, AjaxGetUnitJson } from './socket';

import { connect } from 'react-redux';
import { isUndefined } from './f';
import './css/grid.css';
import './App.scss';
import './animations.css';

import StartScreen from './App/StartScreen.jsx';
import ActiveGame from './App/ActiveGame.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    document.title = 'Pixel Auto Chess';
    this.state = {chatMessageInput: ''};
  }
  // Event listener example, can be attached to example buttons
  
  // Event logic

  

  getPosCoords = (pos) => {
    return pos.split(',');
  }

  setBuffsFromSolo = (buffs, solo, type) => {
    const buff = solo[type];
    if(buff) {
      buffs[buff['typeBuff']] = (buffs[buff['typeBuff']] || 0) + buff['value'];
    }
  }

  // TODO: Load unitJson
  displayUnitList = () => {
    if(this.props.loadedUnitJson) {
      // TODO: Display here
      // this.props.unitJson
    } else {
      AjaxGetUnitJson(this.props.dispatch);
    }
  }

  visitPlayer = (playerIndex) => {
    console.log('Visiting Player', playerIndex, '...')
    this.props.dispatch({type: 'SPEC_PLAYER', playerIndex})
  }

  handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100; // this.audioElement.length * 
    // console.log('@handleVolumechange', e.target.value)
    this.props.dispatch({type: 'CHANGE_VOLUME', newVolume})
  }

  handleChatSubmit = (event) => {
    if(this.state.chatMessageInput !== '') {
      sendMessage(this.state.chatMessageInput);
    }
    this.setState({...this.state, chatMessageInput: ''})
    event.preventDefault();
  }

  render() {
    if (!this.props.gameIsLive) {
      // Thats horrible way. Maybe we should connect state in StartScreen instead.
      return <StartScreen {...this.props} />;
    }

    return <ActiveGame {...this.props} />;
  }
}

// Thats not good :{
const mapStateToProps = state => ({
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
  storedState: state.storedState,
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
  winner: state.winner,
  dmgBoard: state.dmgBoard,
  selectedUnit: state.selectedUnit,
  mouseOverId: state.mouseOverId,
  stats: state.stats,
  statsMap: state.statsMap,
  typeStatsString: state.typeStatsString,
  typeBonusString: state.typeBonusString,
  typeMap: state.typeMap,
  round: state.round,
  musicEnabled: state.musicEnabled,
  soundEnabled: state.soundEnabled,
  chatSoundEnabled: state.chatSoundEnabled,
  selectedSound: state.selectedSound,
  soundEffect: state.soundEffect,
  soundEffects: state.soundEffects,
  music: state.music,
  volume: state.volume,
  startTimer: state.startTimer,
  isDead: state.isDead,
  selectedShopUnit: state.selectedShopUnit,
  isSelectModeShop: state.isSelectModeShop,
  boardBuffs: state.boardBuffs,
  deadPlayers: state.deadPlayers,
  gameEnded: state.gameEnded,
  pokemonSprites: state.pokemonSprites,
  unitJson: state.unitJson,
  loadedUnitJson: state.loadedUnitJson,
  alternateAnimation: state.alternateAnimation,
  loaded: state.loaded,
  visiting: state.visiting,
  showDmgBoard: state.showDmgBoard,
  timerDuration: state.timerDuration,
  dmgBoardTotalDmg: state.dmgBoardTotalDmg,
  markedBuff: state.markedBuff,
  displayMarkedBuff: state.displayMarkedBuff,
  debugMode: state.debugMode,
  prevDmgBoard: state.prevDmgBoard,
  loadingCounter: state.loadingCounter,
});

export default connect(mapStateToProps)(App);
// TODO: Add react code here to connect to the reducer (state)

//export default App;
