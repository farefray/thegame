import React, { Component } from 'react';
import Board from './GameBoard/Board.jsx';

class GameBoard extends Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
   return <div className={(!this.props.onGoingBattle ? 'boardDiv' : 'boardDivBattle')}>
   <div>
     <Board height={8} width={8} map={this.props.myBoard} isBoard={true} newProps={this.props}/>
   </div>
   <div className='levelDiv'>
     <div className={`levelBar overlap ${(this.props.exp === 0 ? 'hidden' : '')}`} 
     style={{width: (this.props.expToReach !== 0 ? String(this.props.exp/this.props.expToReach * 100) : '100') + '%'}}/>
     <div className='biggerText centerWith50 overlap levelText'>
       <span className='text_shadow paddingLeft5 paddingRight5'>{'Level ' + JSON.stringify(this.props.level, null, 2)}</span>
       {<span className='text_shadow paddingLeft5 paddingRight5'>{'( ' + (this.props.expToReach === 'max' ? 'max' : this.props.exp + '/' + this.props.expToReach) + ' )'}</span>}
     </div>
     <div className='overlap text_shadow marginTop5 paddingLeft5 levelTextExp'>
       {'Exp: ' + this.props.exp + '/' + this.props.expToReach}
     </div>
   </div>
   <div className={`flex center ${(this.props.index === this.props.visiting ? 'handDiv' : 'handDivVisiting')}`}>
     <Board height={1} width={8} map={this.props.myHand} isBoard={false} newProps={this.props}/>
   </div>
 </div>;
  }
}

export default GameBoard;