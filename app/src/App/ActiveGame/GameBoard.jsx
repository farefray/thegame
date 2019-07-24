import React, { Component } from 'react';
import { placePieceEvent } from '../../events'
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { toBoardPosition } from '../../shared/BoardUtils.js';

class GameBoard extends Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  componentDidMount () { };

  createEmptyArray (height, width) {
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
    const position = toBoardPosition(parseInt(destination.droppableId), 0)
    if (selectedUnit.pos && position !== selectedUnit.pos &&
      selectedUnit.unit && selectedUnit.displaySell) {
      placePieceEvent(this.props, selectedUnit.pos, position);
    }
  };

  render () {
    const boardData = {
      data: this.createEmptyArray(9, 8),
      map: this.props.myBoard,
      myHand: this.props.myHand,
      isBoard: true
    }

    let counter = 0;
    return boardData.data.map((datarow) => {
      return <DndProvider backend={HTML5Backend}>
        <div className='board-column' key={counter++}>{
          datarow.map((dataitem) => {
            let key = dataitem.x * datarow.length + dataitem.y;
            const isBoard = dataitem.y !== 0;

            return (
              <BoardSquare key={key} value={dataitem} isBoard={isBoard} map={isBoard ? boardData.map : boardData.myHand} newProps={this.props} />
            );
          })}
        </div>
      </DndProvider>
    });
  }
}

export default GameBoard;