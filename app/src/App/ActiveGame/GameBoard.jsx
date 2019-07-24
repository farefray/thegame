import React, { Component } from 'react';
import { placePieceEvent } from '../../events'
import Cell from './GameBoard/Cell.jsx';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

class GameBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() { };

  createEmptyArray(height, width) {
    let data = [];
    for (let i = 0; i < height; i++) {
      data[i] = [];
      for (let j = 0; j < width; j++) {
        data[i][j] = {
          x: j,
          y: width - i,
        };
      }
    }

    return data;
  }

  getPos(x, y, isBoard) {
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

  render() {
    const boardData = {
      data: this.createEmptyArray(9, 8),
      map: this.props.myBoard,
      myHand: this.props.myHand,
      isBoard: true
    }

    let counter = 0;
    return boardData.data.map((datarow) => {
      return <div className='board-column' key={counter++}>{
        datarow.map((dataitem) => {
          let key = dataitem.x * datarow.length + dataitem.y;
          const isBoard = dataitem.y !== 0;

          return (
            <Cell key={key} value={dataitem} isBoard={isBoard} map={isBoard ? boardData.map : boardData.myHand} newProps={this.props} />
          );
        })}
      </div>
    });
  }
}

export default GameBoard;