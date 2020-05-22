import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
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

    this.boardRef = React.createRef();
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

    /** TODO use memo for board tiles once its in battle */
    return dndDecorator(
      <div className="gameboard-board">
        <div ref={this.boardRef}>
          {this.props.render(this.boardRef)}

          {gameBoard.map((boardRow, index) => {
            return (
              <div className="gameboard-board-row" key={index}>
                {boardRow.map((cellPosition) => {
                  const innerDebugContent = process.env.REACT_APP_DEBUGMODE ? cellPosition.toBoardPosition() : '';
                  const boardSquare = hasDnD ? (
                    <BoardSquareDnD key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
                      {innerDebugContent}
                    </BoardSquareDnD>
                  ) : (
                    <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
                      {innerDebugContent}
                    </BoardSquare>
                  );

                  return boardSquare;
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default GameBoard;
