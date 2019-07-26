import React, { Component } from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { toBoardPosition } from '../../shared/BoardUtils.js';
import Pawn from './GameBoard/Pawn.jsx';

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
            // Picking map, its hand, board or battleBoard
            const boardMap = isBoard && this.props.onGoingBattle
              ? this.props.battleStartBoard : (isBoard ? boardData.map : boardData.myHand);
            const cellPos = toBoardPosition(dataitem.x, dataitem.y);
            const creature = boardMap[cellPos]
            return (
              <BoardSquare key={key} value={dataitem} isBoard={isBoard} newProps={this.props}>
                {
                  creature && <Pawn position={cellPos} idle={true} name={creature.name} direction={isBoard ? 3 : 1} newProps={this.props}/>
                  // todo pawnstats here
                }
              </BoardSquare>
            );
          })}
        </div>
      </DndProvider>
    });
  }
}

export default GameBoard;