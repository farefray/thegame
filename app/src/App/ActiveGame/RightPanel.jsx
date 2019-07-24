import React, { Component } from 'react';
import ShopPawn from './RightPanel/ShopPawn';
import { refreshShopEvent, buyExpEvent, placePieceEvent, withdrawPieceEvent, sellPieceEvent, toggleLockEvent } from '../../events';
import { sendMessage, AjaxGetUnitJson } from '../../socket';
import { getImage, getTypeImg, getGymImage } from '../../images.js';
import { isUndefined, updateMessage } from '../../f';

class RightPanel extends Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  createScoreboardPlayerEntry = (player, isDead) => {
    const hp = player.hp;
    return <div className='playerScoreboardContainer' key={player.index}>
      <div className='playerScoreboardInner'>
        <span className='flex'>
          <span className='biggerText'><span className={`playerScoreboardName ${(player.index === this.props.index ? 'bold' : '')}`}>
              {player.name}
            </span>
            {(isDead ? <span className='redFont playerScoreboardDead'>
              {' Dead\n'}
            </span> : 
            <span className='playerScoreBoardVisitButtonDiv'>
              {(this.props.visiting !== player.index ? <button className='normalButton visitButton' onClick={() => this.visitPlayer(player.index)}>
                  {(player.index === this.props.index ? 'Home' : 'Visit')}
                </button> : '')}
              <span>{'\n'}</span>
            </span>)}
          </span>
        </span>
        {(this.props.players[player.index] ? <span className='flex'>
          <span className='playerScoreboardLevel'>
            <span>{'Lvl: ' + this.props.players[player.index].level}</span>
          </span>
          <span className='flex'>
            <img className='goldImageScoreboard' src={getImage('pokedollar')} alt='pokedollar'/>
            <span className='goldImageTextSmall'>{this.props.players[player.index].gold}</span>
          </span>
          {(this.props.players[player.index].streak ? <span className='flex'>
            <img className={`streakImage ${(this.props.players[player.index].streak > 0 ? 'flameImage' : 'icecubeImage')}`} 
            src={(this.props.players[player.index].streak > 0 ? getImage('flame') : getImage('icecube'))} alt='trophy'/>
            <span className='streak'>{Math.abs(this.props.players[player.index].streak)}</span>
          </span> : '')}
        </span> : '')}
        <div className='playerHpBarDiv'>
          <div className={`playerHpBar overlap ${(hp === 0 ? 'hidden' : '')}`} 
          style={{width: (hp) + '%'}}/>
          <div className={`playerHpBarText biggerText centerWith50 overlap ${(hp === 100 ? 'playerHpBarTextFull' : '')}`}>
            <span className='text_shadow paddingLeft5 paddingRight5'>{hp + '%'}</span>
          </div>
        </div>
      </div>
    </div>
  }

  playerStatsDiv = () => {
    const players = this.props.players;
    // console.log('@playerStatsDiv, Players: ', players);
    // TODO: Prevent keys of players being null
    const playerKeys = Object.keys(players).filter(key => key !== null && players[key] !== null);
    const sortedPlayersByHp = playerKeys.sort(function(a,b){return players[b].hp - players[a].hp});
    let list = [];
    for(let i = 0; i < sortedPlayersByHp.length; i++){
      const player = players[sortedPlayersByHp[i]];
      // console.log('inner: ', i, sortedPlayersByHp[i], players[sortedPlayersByHp[i]], players[sortedPlayersByHp[i]].hp)
      list.push(this.createScoreboardPlayerEntry(player, false));
    }
    const deadPlayers = this.props.deadPlayers;
    for(let i = 0; i < deadPlayers.length; i++){
      const player = deadPlayers[i];
      list.push(this.createScoreboardPlayerEntry(player, true));
    }
    /*
    Object.keys(deadPlayers).forEach((deadPlayer) => {
      const player = deadPlayers[deadPlayer];
      list.push(this.createScoreboardPlayerEntry(player, true));
    })
    */
    // console.log('@PlayerStatsDiv', sortedPlayersByHp);
    return <div className='scoreboard'>
      <div className='text_shadow biggerText '>
        <span className='playerScoreboardName'>Scoreboard:</span>  
        {list}   
      </div>
    </div>
  }

  handleChatSubmit = (event) => {
    if(this.state.chatMessageInput !== '') {
      sendMessage(this.state.chatMessageInput);
    }
    this.setState({...this.state, chatMessageInput: ''})
    event.preventDefault();
  }

  buildHelp = () => {
    let s = '';
    let s2 = 'Hotkeys:\n';
    s2 += 'Q: Place Unit\n';
    s2 += 'W: Withdraw Unit\n';
    s2 += 'E: Sell Unit\n';
    s2 += 'F: Buy Exp\n';
    s2 += 'D: Refresh Shop\n';
    let chat = false;
    let messageCollection = [];
    switch(this.props.chatHelpMode){
      case 'types':
        if(this.props.typeStatsString){
          s += this.props.typeStatsString;
        } else {
          s += s2;
        }
        break;
      case 'typeBonuses':
        if(this.props.typeBonusString){
          s += this.props.typeBonusString;
        } else {
          s += s2;
        }
        break;
      case 'hotkeys':
        s += s2;
        break;
      case 'chat':
      default:
          //s += this.props.chatMessage;
          for(let i = 0; i < this.props.chatMessages.length; i++){
            messageCollection.push(<div key={i}><span className='text_shadow bold'>{this.props.senderMessages[i]}</span><span>{this.props.chatMessages[i]}</span></div>);
          }
          chat = true;
        break;
    }
    return (chat ? <div>{
    <div className='helpText text_shadow'>
      <span className='bold'>Chat:</span>
      <div className='messageContainerDiv'>
        <div className='messagesContainer'>{messageCollection}</div>
      </div>
      <div style={{ float:"left", clear: "both" }}
        ref={(el) => { this.messagesEnd = el;}}>
      </div>
    </div>}
    <div className='chatTypingDiv'>
      <form onSubmit={this.handleChatSubmit}>
        <label>
          <input placeholder='Type a message ...' className='textInput' type="text" value={this.state.chatMessageInput} 
          onChange={(event) => this.setState({...this.state, chatMessageInput: event.target.value})} />
        </label>
        <input className='text_shadow normalButton chatTypingSubmit' type="submit" value="Submit" />
      </form>
    </div>
    </div> : <div className='helpText text_shadow'>
        <span className='bold'>{'Information:\n'}</span>
        <div className='messageContainerSimple'>{s}</div>
    </div>);
  }

  pos = (x,y) => {
    if(isUndefined(y)){
      return String(x);
    }
    return String(x) + ',' + String(y);
  }

  getDmgBoard = (dmgBoard) => {
    const list = [];
    if(!dmgBoard) return '';
    const keys = Object.keys(dmgBoard);
    const sortedDmgBoard = keys.sort((a,b) => dmgBoard[b] - dmgBoard[a]);
    // keys.forEach(unitName => {
    for(let i = 0; i < sortedDmgBoard.length; i++){
      const unitName = sortedDmgBoard[i];
      const value = dmgBoard[unitName];
      // console.log('@getDmgBoard', value, this.props.dmgBoardTotalDmg)
      const width = value / this.props.dmgBoardTotalDmg * 100 + '%';
      list.push(<div className='dmgBoardUnitDiv' key={unitName}>
        <div className='damageBarDiv'>
          <span className='damageBar friendlyBar' style={{width: width}}></span>
        </div>
        <span className='dmgBoardUnitName'>{unitName + ': '}</span>
        <span className='dmgBoardUnitValue'>{value}</span>
      </div>)
    }
    return list;
  }

  render () {
    return <div className='flex'>
      <div>
        <div>
          <div className='paddingLeft5'>
            <div>
              <div>
                <div className='flex'>
                  <ShopPawn ShopPawn={this.props.myShop[this.pos(0)]} index={0} newProps={this.props} />
                  <ShopPawn ShopPawn={this.props.myShop[this.pos(1)]} index={1} newProps={this.props} />
                  <ShopPawn ShopPawn={this.props.myShop[this.pos(2)]} index={2} newProps={this.props} />
                </div>
                <div className='flex'>
                  <div className='shopInteractDiv'>
                    <div>
                      <img className={`lockImage ${(this.props.lock ? 'shineLock' : '')}`} onClick={() => toggleLockEvent(this.props)}
                        src={this.props.lock ? getImage('lockedLock') : getImage('openLock')} alt='lock' />
                    </div>
                    <div className='refreshShopDiv'>
                      <img className='refreshShopImage' onClick={() => refreshShopEvent(this.props)} src={getImage('refreshShop')} alt='refreshShop' />
                    </div>
                    <div className='flex goldImageRefreshDiv'>
                      <img className='goldImageSmall' src={getImage('goldCoin')} alt='goldCoin' />
                      <div className={`text_shadow goldImageTextSmall ${(this.props.gold < 2 ? 'redFont' : '')}`}>2</div>
                    </div>
                  </div>
                  <ShopPawn ShopPawn={this.props.myShop[this.pos(3)]} index={3} newProps={this.props} className='pokemonShopHalf' />
                  <ShopPawn ShopPawn={this.props.myShop[this.pos(4)]} index={4} newProps={this.props} className='paddingLeft30' />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='marginTop5 paddingLeft5 belowShopDiv'>
          <div className='flex'>
            <div>
              <button style={{ marginLeft: '5px' }} className='rpgui-button' onClick={() => buyExpEvent(this.props)}>Buy Exp</button>
              <div className='flex marginTop5 goldImageBuyExp'>
                <img className='goldImageSmall' src={getImage('goldCoin')} style={{ marginLeft: '18px' }} alt='goldCoin' />
                <div className={`text_shadow goldImageTextSmall ${(this.props.gold < 5 ? 'redFont' : '')}`}>5</div>
              </div>
            </div>
            <div className='toggleHelpDiv'>
              <img className='toggleHelpImg' src={(this.props.help ? getImage('collapse') : getImage('collapseNot'))}
                onClick={() => this.props.dispatch({ type: 'TOGGLE_HELP' })} alt='toggleHelp' />
            </div>
            {(this.props.debugMode ? <div className='text_shadow hoveringDiv'>Hovering: {JSON.stringify(this.props.mouseOverId, null, 2)}</div> : '')}
            <div className={'text_shadow messageUpdate'} style={{ padding: '5px' }} >
              <div className={`updateMessage ${(this.props.messageMode === 'big' ? 'goldFont' : (this.props.messageMode === 'error' ? 'redFont' : ''))}`}>
                {'Message: ' + this.props.message}
              </div>
            </div>
            {/*<div style={{marginLeft: '5px'}}>
           <button className='rpgui-button test_animation' onClick={() => battleReady(this.props.storedState)}>Battle ready</button>
         </div>*/}
          </div>
        </div>
        <div>
          {(this.props.help ? <div className='text_shadow marginTop5'>
            <input className='check' type='radio' name='helpRadio' onChange={() => this.props.dispatch({ type: 'SET_HELP_MODE', chatHelpMode: 'chat' })} />
            <label className='labels'>Chat</label>
            <input className='check' type='radio' name='helpRadio' onChange={() => this.props.dispatch({ type: 'SET_HELP_MODE', chatHelpMode: 'hotkeys' })} />
            <label className='labels'>Hotkeys</label>
            <input className='check' type='radio' name='helpRadio' onChange={() => this.props.dispatch({ type: 'SET_HELP_MODE', chatHelpMode: 'types' })} />
            <label className='labels'>Types</label>
            <input className='check' type='radio' name='helpRadio' onChange={() => this.props.dispatch({ type: 'SET_HELP_MODE', chatHelpMode: 'typeBonuses' })} />
            <label className='labels'>Buffs</label>
            <input className='check' type='radio' name='helpRadio' onChange={() => this.props.dispatch({ type: 'SET_HELP_MODE', chatHelpMode: 'damageBoard' })} />
            <label className='labels'>Damage</label>
          </div> : '')}
          {(!this.props.onGoingBattle && this.props.dmgBoard && Object.keys(this.props.dmgBoard).length > 0 && (this.props.showDmgBoard
            || this.props.chatHelpMode === 'damageBoard') ? <div className='dmgBoardDiv helpText text_shadow'>
              <span className='bold'>Damage Dealt:</span>{this.getDmgBoard(this.props.dmgBoard)}
            </div> : (this.props.onGoingBattle && this.props.prevDmgBoard && Object.keys(this.props.prevDmgBoard).length > 0 && (this.props.showDmgBoard
              || this.props.chatHelpMode === 'damageBoard') ? <div className='dmgBoardDiv helpText text_shadow'>
                <span className='bold'>Damage Dealt Previous Round:</span>{this.getDmgBoard(this.props.prevDmgBoard)}
              </div> : (this.props.help ? this.buildHelp() : '')))}
        </div>
      </div>
      {this.playerStatsDiv()}
    </div>;
  }
}

export default RightPanel;