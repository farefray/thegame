import React, { Component } from 'react';
import { placePieceEvent } from '../../events'
import Cell from './GameBoard/Cell.jsx';

class GameBoard extends Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  componentDidMount () { };

  createEmptyArray(height, width) {
    let data = [];
    for (let i = 0; i < height; i++) {
      data[i] = Array();
      for (let j = 0; j < width; j++) {
        data[i][j] = {
          x: j,
          y: height-i-1,
        };
      }
    }

    return data;
  }
  
  getPos (x, y, isBoard) {
    if (isBoard) {
      return x + ',' + y;
    } else {
      return String(x);
    }
  }

  /**
   * Managing DnD pawns on the board
   *
   * @memberof GameBoard
   */
  onDragEnd = (result) => {
    console.log(result);

    const { source, destination, draggableId } = result;
    console.log(source);
    console.log(destination);
    console.log(draggableId);

    if (!destination) {
      return;
    }

    const selectedUnit = this.props.selectedUnit;
    console.log('selected unit');
    console.log(selectedUnit);
    const position = this.getPos(parseInt(destination.droppableId), 0, false)
    if (selectedUnit.pos && position !== selectedUnit.pos &&
      selectedUnit.unit && selectedUnit.displaySell) {
      placePieceEvent(this.props, selectedUnit.pos, position);
    }
  };

  renderBoard(boardData) {
    let counter = 0;
    return boardData.data.map((datarow) => {
      return <div className='board-column' key={counter++}>{
        datarow.map((dataitem) => {
          let key = dataitem.x * datarow.length + dataitem.y;
          return (
              <Cell key={key} value={dataitem} isBoard={boardData.isBoard} map={boardData.map} newProps={this.props}/>
            );
        })}
      </div>
    });
  }

  render () {
    return <div className='boardDiv'>
      <div>
        <div className='flex center board'> 
          {
            this.renderBoard({
              data: this.createEmptyArray(8, 8),
              map: this.props.myBoard,
              isBoard: true
            })
          }
        </div>
      </div>
      <div className={`flex center board ${(this.props.index === this.props.visiting ? 'handDiv' : 'handDivVisiting')}`}>
        {
          this.renderBoard({
            data: this.createEmptyArray(1, 8),
            map: this.props.myHand,
            isBoard: false
          })
        }
      </div>
      <div className='levelDiv'>
        <div className={`levelBar overlap ${(this.props.exp === 0 ? 'hidden' : '')}`}
          style={{ width: (this.props.expToReach !== 0 ? String(this.props.exp / this.props.expToReach * 100) : '100') + '%' }} />
        <div className='biggerText centerWith50 overlap levelText'>
          <span className='text_shadow paddingLeft5 paddingRight5'>{'Level ' + JSON.stringify(this.props.level, null, 2)}</span>
          {<span className='text_shadow paddingLeft5 paddingRight5'>{'( ' + (this.props.expToReach === 'max' ? 'max' : this.props.exp + '/' + this.props.expToReach) + ' )'}</span>}
        </div>
        <div className='overlap text_shadow marginTop5 paddingLeft5 levelTextExp'>
          {'Exp: ' + this.props.exp + '/' + this.props.expToReach}
        </div>
      </div>
    </div>;
  }
}

export default GameBoard;