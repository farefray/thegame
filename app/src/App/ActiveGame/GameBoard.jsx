import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Position from '../../objects/Position';

const GameBoard = () => {
  const createGameBoard = (height, width) => {
    let data = [];
    for (let i = 0; i < height; i++) {
      data[i] = [];
      for (let j = 0; j < width; j++) {
        data[i][j] = new Position(j, width - i);
      }
    }

    return data;
  }

  let counter = 0;
  return <div className='board-container rpgui-container framed'>
    <div className='flex center board'>
      <DndProvider backend={HTML5Backend}>
        {createGameBoard(9, 8).map((boardColumn) => {
          return <div className='board-column' key={counter++}>{
            boardColumn.map((cellPosition) => {
              return (
                <React.Fragment key={cellPosition.toBoardPosition()}>
                  <BoardSquare cellPosition={cellPosition} />
                </React.Fragment>
              );
            })}
          </div>
        })}
      </DndProvider>
    </div>
  </div>
}

export default GameBoard;