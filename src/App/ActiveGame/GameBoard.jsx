import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
/**
 * TODO: consider using hooks from umihooks
 * import { useDrop, useDrag } from '@umijs/hooks';
 * or consider having 'react-use' repository instead of umihooks
 */
import { DndProvider } from 'react-dnd';
// import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';

import Position from '../../shared/Position';
import BoardSquareDnD from './GameBoard/BoardSquareDnD.jsx';

class GameBoard extends React.Component {
  constructor(props) {
    super(props);

    const { width, height, startingY } = props;
    this.state = {
      gameBoard: this.createGameBoard(parseInt(width), parseInt(height), startingY),
      hasDnD: props.hasDnD
    };
  }

  componentDidMount() {}

  createGameBoard(width, height, startingY = 0) {
    let data = [];
    for (let y = 0; y < height; y++) {
      const rowData = [];
      for (let x = 0; x < width; x++) {
        rowData.push(new Position(x, parseInt(startingY) + height - y - 1));
      }

      data.push(rowData);
    }

    return data;
  }

  render() {
    const { gameBoard, hasDnD } = this.state;
    const dndDecorator = (innerContent) =>
      hasDnD ? (
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          {innerContent}
        </DndProvider>
      ) : (
        innerContent
      );

    return dndDecorator(
      <div className="gameboard-board">
        <div>
          {gameBoard.map((boardRow, index) => {
            return (
              <div className="gameboard-board-row" key={index}>
                {boardRow.map((cellPosition) => {
                  const debugContent = process.env.REACT_APP_DEBUGMODE === 'true' ? cellPosition.toBoardPosition() : '';
                  const boardSquare = hasDnD ? (
                    <BoardSquareDnD key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
                      {debugContent}
                    </BoardSquareDnD>
                  ) : (
                    <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
                      {debugContent}
                    </BoardSquare>
                  );

                  return boardSquare;
                })}
              </div>
            );
          })}
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default GameBoard;
