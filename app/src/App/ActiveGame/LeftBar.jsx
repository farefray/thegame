import React, { Component } from 'react';
import Timer from '../Timer';
import PawnImage from '../PawnImage.jsx';
import { isUndefined, } from '../../f';
import { getImage, getTypeImg } from '../../images.js';
import { sellPieceEvent } from '../../events';
import { getUnitAudio, getSoundEffect } from '../../audio.js';
import { capitalize } from '../../util';

class LeftBar extends Component {
  constructor (props) {
    super(props);
    this.state = {};
  }
  
  

  setBuffsFromSolo = (buffs, solo, type) => {
    const buff = solo[type];
    if(buff) {
      buffs[buff['typeBuff']] = (buffs[buff['typeBuff']] || 0) + buff['value'];
    }
  }

  buildStats = () => {
    if(this.props.stats){
      const s = this.props.stats;
      let evolves_from = '';
      let evolves_to = '';
      let snd_evolves_to = '';
      if(s.evolves_from) {
        evolves_from = <span className='flex'>
          <span className='paddingRight5 marginTop15'>Evolves from: </span>
          <PawnImage name={s.evolves_from} newProps={this.props}/>
        </span>;
      }
      if(s.evolves_to) {
        if(Array.isArray(s.evolves_to)){
          const evoList = [];
          for(let i = 0; i < s.evolves_to.length; i++){
            evoList.push(<span key={'evo'+s.evolves_to[i]}><PawnImage name={s.evolves_to[i]} newProps={this.props}/></span>)
          }
          evolves_to = <span className='flex'>
            <span className='paddingRight5 marginTop15'>Evols: </span>
            {evoList}
          </span>
        } else {
          evolves_to = <span className='flex'>
            <span className='paddingRight5 marginTop15'>Evolves to: </span>
            <PawnImage name={s.evolves_to} newProps={this.props}/>
          </span>
        }
      }
      if(s.snd_evolves_to) {
        snd_evolves_to = <span className='flex'>
          <span className='paddingRight5 marginTop15'>Last Evolve: </span>
          <PawnImage name={s.snd_evolves_to} newProps={this.props}/>
        </span>
      }
      const boardBuffs = this.props.boardBuffs;
      const buffs = {};
      if(boardBuffs){
        const solo = boardBuffs.typeBuffMapSolo
        if(Array.isArray(s.type)){
          this.setBuffsFromSolo(buffs, solo, s.type[0]);
          this.setBuffsFromSolo(buffs, solo, s.type[1]);
        } else {
          this.setBuffsFromSolo(buffs, solo, s.type);
        }
        Object.keys(boardBuffs.typeBuffMapAll).forEach(type => {
          const value = boardBuffs.typeBuffMapAll[type];
          buffs[value['typeBuff']] = (buffs[value['typeBuff']] || 0) + value['value'];
        });
        // Object.keys(boardBuffs.typeDebuffMapEnemy).forEach(e => {
        // });
      }
      // console.log('@buffs', buffs);
      const content = <div className='center'>
        <div className='textAlignCenter marginTop5'>
        {(Array.isArray(s.type) ? 
            <div>
              <span className={`type typeLeft ${s.type[0]}`}>{s.type[0]}</span>
              <span className={`type ${s.type[1]}`}>{s.type[1] + '\n'}</span>
            </div>
          : <span className={`type ${s.type}`}>{s.type + '\n'}</span>)}
        </div>
        {(s.reqEvolve ? <div className='pokemonBabyInfoPanel'>
          <img className='babyImgInfoPanel' src={getImage('baby')} alt={'baby' + s.name}/>
        </div> : '')}
        <div className='infoPanelStats'>
          {/*<div>
            <span>Hp: </span>
            <span style={{position: 'relative'}}>
              <div className='levelBar overlap' style={{width: String(s.hp/150 * 100) + '%'}}></div>
              <div className='overlap'>
                {` ${s.hp}`}
              </div>
            </span>
          </div>*/}
          <span className='center'><span>{`Hp: ${s.hp}`}</span>{(buffs['hp'] ? <span className='infoPanelBuff'>{` + ${buffs['hp']}\n`}</span> : '\n')}</span>
          <span><span>{`Attack: ${s.attack}`}</span>{(buffs['attack'] ? <span className='infoPanelBuff'>{` + ${buffs['attack']}\n`}</span> : '\n')}</span>
          <span><span>{`Defense: ${s.defense}`}</span>{(buffs['defense'] ? <span className='infoPanelBuff'>{` + ${buffs['defense']}\n`}</span> : '\n')}</span>
          <span><span>{`Speed: ${s.speed}`}</span>{(buffs['speed'] ? <span className='infoPanelBuff'>{` + ${buffs['speed']}\n`}</span> : '\n')}</span>
          <span><span>{`Sp.Attack: ${s.specialAttack}`}</span>{(buffs['specialAttack'] ? <span className='infoPanelBuff'>{` + ${buffs['specialAttack']}\n`}</span> : '\n')}</span>
          <span><span>{`Sp.Defense: ${s.specialDefense}`}</span>{(buffs['specialDefense'] ? <span className='infoPanelBuff'>{` + ${buffs['specialDefense']}\n`}</span> : '\n')}</span>
          <span>{`Level: ${s.cost}\n`}</span>
          <span>{`Range: ${s.range || 1}\n`}</span>
          <span className={`type ${s.abilityType}`}>{`Ability: ${s.abilityDisplayName}\n`}</span>
        </div>
        <div>
          {evolves_from}
          {evolves_to}
          {snd_evolves_to}
        </div>
      </div>
      return content;
    }
  }

  statsRender = (className, name, allowSell=false) => {
    return <div className={className}>
      <div className='textAlignCenter'>
        <div>{this.props.stats.displayName}</div>
        <div className='infoPanelPokemonLogo'>
        <PawnImage name={name} newProps={this.props}/>
        </div>
      </div>
      {this.buildStats()}
      {(allowSell ? <div className='marginTop5'>
        <button className='normalButton textList marginLeft5' onClick={() => {
          const from = this.props.selectedUnit.pos;
          sellPieceEvent(this.props, from);
        }}>
          <span>
            {'Sell ' + this.props.stats.displayName + '\n'}
          </span>
          <span className='flex centerWith50'>
            <img className='goldImageSmallest' src={getImage('pokedollar')} alt='pokedollar'/>
            <span className='goldImageTextSmall'>{this.props.stats.cost}</span>
          </span>
        </button>
      </div> : '')}
    </div>;
  }

  selectedUnitInformation = () => {
    const className = 'center text_shadow infoPanel';
    const noSelected = <div className={className}><div className={`noSelected`}>No unit selected</div></div>
    if(this.props.stats && !this.props.isSelectModeShop && !isUndefined(this.props.selectedUnit)){
      let pokemon = (this.props.selectedUnit.isBoard ? (this.props.onGoingBattle && this.props.battleStartBoard ? this.props.battleStartBoard[this.props.selectedUnit.pos] 
        : this.props.myBoard[this.props.selectedUnit.pos]) : this.props.myHand[this.props.selectedUnit.pos]);
      if(pokemon){
        this.props.dispatch({type: 'NEW_UNIT_SOUND', newAudio: getUnitAudio(pokemon.name)});
        //console.log('@selectedUnitInformation', pokemon.displayName, pokemon)
        const displaySell = this.props.selectedUnit.isBoard && this.props.onGoingBattle && this.props.battleStartBoard ? false : this.props.selectedUnit.displaySell;
        return this.statsRender(className, pokemon.name, displaySell);
      }
    } else if(this.props.stats && this.props.isSelectModeShop && this.props.selectedShopUnit !== ''){
      const name = this.props.selectedShopUnit;
      this.props.dispatch({type: 'NEW_UNIT_SOUND', newAudio: getUnitAudio(name)});
      return this.statsRender(className, name)
    }
    return noSelected;
  }

  unitSound = () => {
    let ref = React.createRef();
    return (this.props.soundEnabled ? <audio ref={ref} src={this.props.selectedSound} onLoadStart={() => ref.current.volume = this.props.volume} autoPlay/> : '')
    // return <Audio loopEnabled={false} source={this.props.selectedSound} newProps={this.props}/>
  }

  /*
    soundEffect = () => {
      let ref = React.createRef();
      return (this.props.soundEnabled ? <audio ref={ref} src={this.props.soundEffect} onLoadStart={() => ref.current.volume = this.props.volume} autoPlay/> : '')
      // return <Audio loopEnabled={false} source={this.props.soundEffect} newProps={this.props}/>
    }
  */
 soundEffects = () => {
    let audioObjects = [];
    for(let i = 0; i < this.props.soundEffects.length; i++){
      const source = this.props.soundEffects[i];
      if(source === '')
        continue;
      let ref = React.createRef();
      const audioEl = <audio ref={ref} key={'sound' + source + i} src={source} onLoadStart={() => ref.current.volume = this.props.volume} autoPlay/>;
      const chatSound = getSoundEffect('pling');
      audioObjects.push((this.props.soundEnabled && source !== chatSound) || (source === chatSound && this.props.chatSoundEnabled) ? audioEl : '');
    }
    return audioObjects;
    // return <Audio loopEnabled={false} source={this.props.soundEffect} newProps={this.props}/>
  }

  displayBuffs = () => this.displayBuffsRender(this.props.boardBuffs);

  displayEnemyBuffs = () => {
    const boardBuffsVar = this.props.players[this.props.enemyIndex];
    // console.log('displayEnemyBuffs', (boardBuffsVar.boardBuffs ? boardBuffsVar.boardBuffs.buffMap : '')); // boardBuffsVar, (boardBuffsVar ? boardBuffsVar.boardBuffs : '')
    if(boardBuffsVar && boardBuffsVar.boardBuffs) { //
      return this.displayBuffsRender(boardBuffsVar.boardBuffs, true);
    }
  }

  displayBuffsRender = (boardBuffs, isEnemy = false) => {
    const list = [];
    let counter = 0;
    // if(isEnemy) console.log('DisplayBuffsRender', boardBuffs);
    const buffKeys = Object.keys(boardBuffs.buffMap);
    const sortedBuffKeys = buffKeys.sort((a,b) => {
      const markedA = boardBuffs.typeBuffMapSolo[a] || boardBuffs.typeBuffMapAll[a] || boardBuffs.typeDebuffMapEnemy[a];
      const markedB = boardBuffs.typeBuffMapSolo[b] || boardBuffs.typeBuffMapAll[b] || boardBuffs.typeDebuffMapEnemy[b];
      const ma = (markedA ? markedA['tier'] : 0);
      const mb = (markedB ? markedB['tier'] : 0);
      return mb - ma;
    });
    // Object.keys(boardBuffs.buffMap).forEach(type => {
    for(let i = 0; i < sortedBuffKeys.length; i++){
      const type = sortedBuffKeys[i];
      const amount = boardBuffs.buffMap[type];
      const marked = boardBuffs.typeBuffMapSolo[type] || boardBuffs.typeBuffMapAll[type] || boardBuffs.typeDebuffMapEnemy[type];
      let bonus;
      const reqs = this.props.typeMap[type]['req'];
      let reqVar = reqs[0];
      if(!isUndefined(marked)){
        reqVar = reqs[marked['tier']];
        bonus = <div>
          <span className={`${(!isEnemy ? 'typeTier' : 'typeTierSmaller')}`}>{marked['tier']}</span>
          {/*<span>{' Bonus: ' + marked['typeBuff'] + ': ' + marked['value']}</span>*/}
        </div>
      }
      const left = (!isEnemy ? counter * 40 % 160 : counter * 30 % 180);
      const top = (!isEnemy ? Math.floor(counter / 4) * 60 : Math.floor(counter / 6) * 30);;
      list.push(<span key={type} className='typeElement' style={{marginLeft: left, marginTop: top}} onClick={() => this.props.dispatch({type: 'SET_MARKED_BUFF', buff: type})}>
        <img className={`${(isEnemy ? 'typeImgSmaller' : 'typeImg')}`} src={getTypeImg(type)} alt={type}/>
        {(!isEnemy ? <span>
          <span className='typeBonusText'>{amount}</span>
          <span className='typeBonusTextBelow'>{type}</span>
          <span className='typeBonusTextReq'>{reqVar}</span>
        </span> : <span>
          <span className='typeBonusTextSmaller'>{amount}</span>
        </span>)}
        {bonus}
      </span>
      );
      counter += 1;
    };
    let buffInfoDiv;
    if(this.props.markedBuff && this.props.displayMarkedBuff && !isEnemy) {
      const buffedType = this.props.markedBuff;
      const marked = boardBuffs.typeBuffMapSolo[buffedType] || boardBuffs.typeBuffMapAll[buffedType] || boardBuffs.typeDebuffMapEnemy[buffedType];
      let tier = 0;
      if(!isUndefined(marked)){
        tier = marked['tier'];
        //bonus = marked['typeBuff'] + ': ' + marked['value'];
      }
      const type = this.props.typeMap[buffedType];
      // console.log('@Type', type, type['req'], type['req'][0]);
      const typeName = type['name'];
      const capitalTypeName = capitalize(typeName);
      const req = type['req'];
      const bonusType = type['bonusType'];
      const inc = (bonusType !== 'enemyDebuff' ? 'Increases' : 'Decreases');
      const units = (bonusType === 'bonus' ? `all ${typeName} typed units` : (bonusType === 'allBonus' ? 'all units' : 'all enemy units'));
      const bonusAmount = type['bonusAmount'];
      const bonusStatType = type['bonusStatType'];
      if(!isUndefined(req)) {
        let classList = (0 < tier ? 'goldFont' : '');
        let reqList = [<span key={'disp_0' + typeName} className={`${classList}`}>{req[0]}</span>];
        let bonusAmountList = [<span key={'dispValue_0'} className={`${classList}`}>{bonusAmount[0]}</span>];
        for(let i = 1; i < req.length; i++){
          classList = (i < tier ? 'goldFont' : '');
          // console.log('i: ', i, req[i], bonusAmount[i]);
          reqList.push(<span key={'disp_' + i + '_' + typeName} className={`${classList}`}>{', ' + req[i]}</span>);
          bonusAmountList.push(<span key={'dispValue_' + i} className={`${classList}`}>{', ' + bonusAmount[i]}</span>);
        }
       buffInfoDiv = <div className='buffInfoDiv' style={{marginTop: Math.floor((counter - 1) / 4) * 60 + 60}}>
          <span>{capitalTypeName + ': '}</span>
          <span>{'['}</span>{reqList}<span>{']'}</span>
          <span>{` ${inc} ${bonusStatType} for ${units} `}</span>
          <span>{'['}</span>{bonusAmountList}<span>{']'}</span>
        </div>;
      }
      // return `${capitalize(typeName)}: [${req}] ${inc} ${bonusStatType} for ${units} [${bonusAmount}]`;
    }
    return <div className='typeDiv'>
      <div>
        {list}
      </div>
      <div>
        {buffInfoDiv}
      </div>
    </div>;
  }

  handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100; // this.audioElement.length * 
    // console.log('@handleVolumechange', e.target.value)
    this.props.dispatch({ type: 'CHANGE_VOLUME', newVolume })
  }
  
  render () {
    return <div className='leftBar'>
      {this.props.gameIsLive ? <Timer startTime={this.props.timerDuration} key={this.props.round} startTimer={this.props.startTimer}
        storedState={this.props.storedState} dispatch={this.props.dispatch} gameEnded={this.props.gameEnded}></Timer> : ''}
      <div>
        {this.selectedUnitInformation()}
        {this.unitSound()}
        {this.soundEffects()}
      </div>
      <div className='boardBuffs text_shadow'>
        {(this.props.boardBuffs && this.props.boardBuffs.buffMap && Object.keys(this.props.boardBuffs.buffMap).length > 0 ?
          this.displayBuffs() : '')}
      </div>
      <div className='battleEnemyBuffs text_shadow'>
        {(this.props.onGoingBattle && !Number.isNaN(this.props.enemyIndex) ?
          this.displayEnemyBuffs() : '')}
      </div>
      <div className='flex musicDiv'>
        <div onClick={() => this.props.dispatch({ type: 'TOGGLE_MUSIC' })}>
          <img className='musicImg' src={(this.props.musicEnabled ? getImage('music') : getImage('musicMuted'))} alt={(this.props.musicEnabled ? 'Mute Music' : 'Turn on Music')} />
        </div>
        <div onClick={() => this.props.dispatch({ type: 'TOGGLE_SOUND' })}>
          <img className='soundImg' src={(this.props.soundEnabled ? getImage('sound') : getImage('soundMuted'))} alt={(this.props.soundEnabled ? 'Mute Sound' : 'Turn on Sound')} />
        </div>
        <img className='chatSoundImg' src={(this.props.chatSoundEnabled ? getImage('chatSound') : getImage('chatSoundMuted'))}
          onClick={() => this.props.dispatch({ type: 'TOGGLE_CHAT_SOUND' })} alt='chatSoundToggle' />
        {(this.props.musicEnabled && this.props.gameIsLive ? this.playMusic() : '')}
      </div>
      <div className='paddingLeft5 marginTop5 text_shadow'>
        <input
          type="range"
          className="volume-bar"
          value={this.props.volume * 100}
          min="0"
          max="100"
          step="0.01"
          onChange={this.handleVolumeChange}
        />
      </div>
      {<div>Selected Unit: {JSON.stringify(this.props.selectedUnit, null, 2)}</div>}
    </div>;
  }
}

export default LeftBar;