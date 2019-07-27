import React, { Component } from 'react';
import { getImage, getGymImage } from '../../images.js';

class TopBar extends Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  getAmountOfUnitsOnBoard = () => {
    const unitsOnBoard = Object.keys(this.props.myBoard).length;
    const level = this.props.level;
    const content = <span className={(unitsOnBoard > level ? 'redFont' : '')}>{unitsOnBoard}</span>
    return <div className='marginTop5 flex topBarPieceDiv'>
      <img style={{marginTop: '-5px'}} className='pieceImg' src={getImage('pieceImg')} alt='Pieces'/>
      <div className='biggerText text_shadow paddingLeft5'>
        <span className='pieceDiv'> : {content} / {level}</span>
      </div>
    </div>;
  }

  render () {
   return <div className='flex topBarDiv'>
        <div className='flex topBarPlayerName'>
          <div className='marginTop5 biggerText text_shadow paddingLeft5'>
            {(this.props.visiting === this.props.index ? this.props.playerName : 
            <span><span className='goldFont'>{'Visit: '}</span><span>{this.props.players[this.props.visiting].name}</span></span>)}
          </div>
        </div>
        <div className='marginTop5 biggerText text_shadow topBarRound'>
          {'Round: ' + this.props.round}
        </div>
        {this.getAmountOfUnitsOnBoard()}
        <div className='flex topBarPadding'>
          <img className='goldImage' src={getImage('goldCoin')} alt='goldCoin'/>
          <div className='marginTop5 biggerText'>
            <span className='text_shadow paddingLeft5'>{JSON.stringify(this.props.gold, null, 2)}</span>
          </div>
        </div>
        <div className='marginTop5 biggerText text_shadow topBarPadding'>
          {(this.props.onGoingBattle ? <div className='redFont'>
            {(this.props.enemyIndex ? <span className='nextUpText'>
              {(this.props.players[this.props.enemyIndex] && (this.props.roundType === 'pvp' || this.props.roundType === 'shop') ? 
                this.props.players[this.props.enemyIndex].name : this.props.enemyIndex) }
            </span>: '')}
            {(this.props.roundType === 'gym' ? <img className='gymLeader' src={getGymImage(this.props.enemyIndex)} alt={this.props.enemyIndex}/> : '')}
          </div> : <div>
            {(this.props.enemyIndex !== -1 ? <span className='nextUpText'>{'Up next: ' + (this.props.enemyIndex !== '' ? '' : 
              (this.props.roundType === 'npc' ? 'Npc Battle' : (this.props.roundType === 'pvp' ? 'PvP Battle' : '')))} 
            </span>: '')}
            {(this.props.roundType === 'gym' ? <img className='gymLeader upNext' src={getGymImage(this.props.enemyIndex)} alt={this.props.enemyIndex}/>: '')}
          </div>)}
        </div>
      </div>;
  }
}

export default TopBar;