import React, {
  Component
} from 'react';

import { buyUnitEvent, getStatsEvent, placePieceEvent } from '../events';
import { isUndefined, updateMessage } from '../f';
import PawnImage from './PawnImage';

class Cell extends Component {
  state = {
    ...this.state,
    pos: this.getPos(this.props.value.x, this.props.value.y),
    selPos: this.props.newProps.selectedUnit,
  }

  getPos(x,y){
    if(this.props.isBoard){
      return x + ',' + y;
    } else{
      return String(x);
    }
  }

  handleCellClick(el){
    const unit = (el.props.isBoard ? (el.props.newProps.onGoingBattle ? el.props.newProps.battleStartBoard[this.state.pos] : el.props.newProps.myBoard[this.state.pos]) : el.props.newProps.myHand[this.state.pos]);
    const prevSelectedUnit = el.props.newProps.selectedUnit;
    console.log('@handleCellClick pressed', el.props.value.x, ',', el.props.value.y)
    // console.log(' -', el.props.isBoard, el.props.newProps.onGoingBattle, this.state.pos, unit, prevSelectedUnit)
    // If unit selected -> presses empty -> place piece 
    if(this.state.pos !== prevSelectedUnit.pos){ // Shouldn't do anything if same tile as SELECT_UNIT Tile
      el.props.newProps.dispatch({ type: 'SELECT_UNIT', selectedUnit: {...el.props.value, isBoard: el.props.isBoard, pos: this.state.pos, unit: unit, displaySell: true}});
    } else if (!prevSelectedUnit.displaySell) { 
      el.props.newProps.dispatch({ type: 'SELECT_UNIT', selectedUnit: {...el.props.value, isBoard: el.props.isBoard, pos: this.state.pos, unit: unit, displaySell: true}});
    } else { // Deselect by doubleclick same unit
      el.props.newProps.dispatch({ type: 'SELECT_UNIT', selectedUnit: ''}); // {isBoard: el.props.isBoard, pos: ''}
    }
    if(unit){ // Pressed unit
      console.log('Get Stats for', unit.name)
      el.props.newProps.dispatch({ type: 'NEW_UNIT_SOUND', newAudio: ''});
      getStatsEvent(el.props.newProps, unit.name);
    } else if(prevSelectedUnit.pos && this.state.pos !== prevSelectedUnit.pos && 
              prevSelectedUnit.unit && prevSelectedUnit.displaySell){ // Pressed empty cell
      placePieceEvent(this.props.newProps, prevSelectedUnit.pos, this.state.pos);
    }
  }

  handleMouseOver(event, self){
    //console.log('@handleMouseEvent', event, self)
    const x = event.clientX;
    const y = event.clientY;
    const el = document.elementFromPoint(x, y);
    let id = (el.id === '' ? 
      (el.parentElement.id === '' ? 
        (el.parentElement.parentElement.id === '' ? 
          (el.parentElement.parentElement.parentElement.id === '' ? 
            (el.parentElement.parentElement.parentElement.parentElementid === '' ? '' : el.parentElement.parentElement.parentElement.parentElement.id) 
          : el.parentElement.parentElement.parentElement.id) 
        : el.parentElement.parentElement.id) 
      : el.parentElement.id) : el.id);
    if(self.props.newProps.mouseOverId !== id){
      // console.log('Mousing Over:', id);
      self.props.newProps.dispatch({type: 'SET_MOUSEOVER_ID', mouseOverId: id})        
    }
  }

  getValue() {
    // console.log('@Cell.getValue value =', value)
    // console.log('@Cell.getValue', this.props.map, this.props.map[this.getPos(value.x,value.y)])
    if(this.props.map){
      let pokemon;
      const sideLength = 85;
      // console.log('@getValue', this.props.isBoard && this.props.newProps.onGoingBattle)
      if(this.props.isBoard && this.props.newProps.onGoingBattle && this.props.newProps.battleStartBoard){ // Battle
        // console.log('I WANT TO BE RERENDERED', this.props.newProps.battleStartBoard);
        pokemon = this.props.newProps.battleStartBoard[this.state.pos];
        // (Math.min(pokemon.hp, pokemon.maxHp) / Math.max(pokemon.hp, pokemon.maxHp) * 100)
        if(pokemon) { 
          // (pokemon.hp + pokemon.hp-pokemon.maxHp / Math.max(pokemon.hp, pokemon.maxHp) * 100);
          const percHp = (Math.min(pokemon.hp, pokemon.maxHp) / pokemon.startHp) * 100; // (pokemon.hp > pokemon.maxHp ? (1 - ((pokemon.hp - pokemon.startHp) / pokemon.startHp)) : (pokemon.hp / pokemon.maxHp)) * 100;// ;
          const percShield = (pokemon.hp > pokemon.maxHp ? (pokemon.hp - pokemon.maxHp) / pokemon.startHp * 100 : 0); // (pokemon.hp > pokemon.maxHp ? ((pokemon.hp - pokemon.startHp) / pokemon.startHp) * 100 : 0);
          const shieldMarginLeft = ((percHp / 100.0) * sideLength) - 2; // - 13);
          const hpBar = <div className='barContainer' style={{width: sideLength}}>
              <p className='hpText text_shadow'>
                {`${pokemon.hp}/${pokemon.startHp}`}
              </p>
              <div color={pokemon.team} className={`hpBar ${percShield > 0 ? 'barBorderShield' : 'barBorderNormal'}`} style={{width: percHp + '%'}}/>
              {(percShield > 0 ? <div className='shieldBar' style={{width: percShield + '%', marginLeft: shieldMarginLeft + 'px'}}/> : '')}
            </div>;
            {/*<div className={`hpBar  ${(pokemon.team === 0 ? 'friendlyBar' : 'enemyBar')}`} 
              style={{width: (pokemon.hp / Math.max(pokemon.hp, pokemon.maxHp) * 100)+'%'}}>*/}
            /*(pokemon.hp > pokemon.maxHp ? <div className={`boostBar text_shadow ${(this.props.isBoard ? 'boostBar' : '')}`} 
              style={{width: (pokemon.hp-pokemon.maxHp / pokemon.hp1 * 100)+'%'}}/> : '')} 
            </div> : '')*/
          const manaBar = <div className={`barDiv ${(pokemon.mana === 0 ? 'hidden' : '')}`} style={{width: sideLength}}>
              <p class='manaText text_shadow'>
                {`${pokemon.mana}/${pokemon.manaCost}`}
              </p>
              <div className={`manaBar text_shadow
                ${(pokemon.mana >= pokemon.manaCost ? 'colorPurple' : '')}`} style={{width: (pokemon.mana / pokemon.manaCost * 100)+'%'}}/>
            </div>;
          const actionMessage = (pokemon.actionMessage && pokemon.actionMessage !== '' ? 
            <div className={`text_shadow actionMessage ${(pokemon.actionMessage.split(' ').length > 2 ? 'actionMessagePadding' : '')}`} style={{position: 'absolute'}}>
              {pokemon.actionMessage}
            </div>
            : '');
          let styleVar = {position: 'relative'};
          if(pokemon.animateMove){
            styleVar = pokemon.animateMove;
            // console.log('StyleVar', pokemon.name, styleVar)
          }
          const back = (this.props.isBoard ? (!isUndefined(pokemon.team) ? pokemon.team === 0 : true) : false);
          const classList = `absolute ${(pokemon.winningAnimation ? ' winningAnimation' : (pokemon.attackAnimation ? ' ' + pokemon.attackAnimation : ''))} ` +
              `${(this.props.newProps.onGoingBattle && !this.props.isBoard ? 'pokemonEnter' : '')}`;
          // console.log('@rendereding PawnImage classList', classList)
          return <div className={`relative`} style={styleVar}>
            <PawnImage name={pokemon.name} back={back} sideLength={sideLength} classList={classList} newProps={this.props.newProps} isBoard={this.props.isBoard}/>
            {hpBar}
            {manaBar}
            {actionMessage}
          </div>
        }
      } else {
        pokemon = this.props.map[this.state.pos];
        // if(pokemon && pokemon.buff) console.log(pokemon.buff)
        let buffs = '';
        if(this.props.isBoard){
          let pokemonBuffList = [];
          if(pokemon && pokemon.buff && pokemon.buff.length > 0){
            // console.log('@stuff', pokemonBuffList, pokemon.buff.length)
            for(let i = 0; i < pokemon.buff.length; i++){
              pokemonBuffList.push(<span key={'buff' + pokemon.buff[i]}>{pokemon.buff[i] + '\n'}</span>);
            }
          }
          buffs = (pokemon && pokemon.buff && pokemon.buff.length > 0 ? <div className='text_shadow textList buffText'>Buffed: {pokemonBuffList}</div> : '');
        }
        if(!isUndefined(pokemon)){
          const back = (this.props.isBoard ? (!isUndefined(pokemon.team) ? pokemon.team === 0 : true) : false);
          return <div>
            <PawnImage name={pokemon.name} back={back} sideLength={sideLength} newProps={this.props.newProps} isBoard={this.props.isBoard}/>
            {buffs}
          </div>
        }
      }
    }
    return null;
  }

  render() {
    // console.log('@renderCell', this.props.selectedUnit)
    const selPos = this.props.newProps.selectedUnit;
    //console.log('@Cell.render', selPos, this.props.newProps.selectedUnit)
    let className = 'cell' +
    (!isUndefined(selPos) && this.props.isBoard === selPos.isBoard && selPos.displaySell &&
    selPos.x === this.props.value.x && selPos.y === this.props.value.y ? ' markedUnit' : '');
    return (
      <div id={this.state.pos} className={className} onClick={() => this.handleCellClick(this)} 
        onMouseOver={(event) => this.handleMouseOver(event, this)}>
        {this.getValue()}
      </div>
    );
  }
}

export default Cell;
