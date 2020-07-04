import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import Position from '../../shared/Position';

class GameBoard extends React.Component {
  constructor(props) {
    super(props);

    const { width, height, startingY } = props;
    this.state = {
      gameBoard: this.createGameBoard(parseInt(width), parseInt(height), startingY),
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
    const { gameBoard } = this.state;
    return (
      <div className="gameboard-board">
        <div>
          {gameBoard.map((boardRow, index) => {
            return (
              <div className="gameboard-board-row" key={index}>
                {boardRow.map((cellPosition) => {
                  const debugContent = process.env.REACT_APP_DEBUGMODE === 'true' ? cellPosition.toBoardPosition() : '';

                  return <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
                  {debugContent}
                </BoardSquare>;
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
