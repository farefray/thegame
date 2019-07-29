import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { toBoardPosition } from '../../shared/BoardUtils.js';

const GameBoard = () => {
  const createEmptyArray = (height, width) => {
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

  let counter = 0;
  return <div className='board-container rpgui-container framed'>
    <div className='flex center board'>
      {createEmptyArray(9, 8).map((datarow) => {
        return <DndProvider key={counter} backend={HTML5Backend}>
          <div className='board-column' key={counter++}>{
            datarow.map((cellPosition) => {
              const boardPosition = toBoardPosition(cellPosition.x, cellPosition.y);
              return (
                <React.Fragment key={boardPosition}>
                  <BoardSquare cellPosition={cellPosition} />
                </React.Fragment>
              );
            })}
          </div>
        </DndProvider>
      })}
    </div>
  </div>
}

export default GameBoard;