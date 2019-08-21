import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Flipper, Flipped } from 'react-flip-toolkit';

import Position from '../../objects/Position';
import Pawn from './GameBoard/Pawn';

const GameBoard = ({ board }) => {
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
      <Flipper flipKey={Object.keys(board).join('')} spring={{
            stiffness: 50,
            damping: 25
          }} stagger={false}>
        <DndProvider backend={HTML5Backend}>
          {createGameBoard(9, 8).map((boardColumn) => {
            return <div className='board-column' key={counter++}>{
              boardColumn.map((cellPosition) => {

                const creature = board[cellPosition.toBoardPosition()];
                const key = creature && creature.position ? `c_${creature.position}` : cellPosition.toBoardPosition();
                return (<BoardSquare cellPosition={cellPosition}>
                  <Flipped key={key} flipId={key}>
                    {flippedProps => ((!!creature && (<Pawn cellPosition={cellPosition} idle={true} name={creature.name} direction={creature.team === 1 ? 3 : 1} flippedProps={flippedProps}/>)) || <div/>)}
                  </Flipped>
                  </BoardSquare>
                );
              })}
            </div>
          })}
        </DndProvider>
        </Flipper>
    </div>
  </div>
}

export default GameBoard;