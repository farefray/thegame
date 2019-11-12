import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Position from '../../shared/Position';
import UnitsWrapper from './GameBoard/UnitsWrapper.jsx';

const gameBoardWidth = 8;
const gameBoardHeight = 8;

class GameBoard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameBoard: this.createGameBoard(gameBoardHeight, gameBoardWidth)
    };

    this.boardRef = React.createRef();
  }

  componentDidMount() {}

  createGameBoard(width, height) {
    let data = [];
    for (let y = height - 1; y >= -1; y--) {
      const rowData = [];
      for (let x = 0; x < width; x++) {
        rowData.push(new Position(x, y));
      }
      data.push(rowData);
    }

    return data;
  }

  render() {
    const { gameBoard } = this.state;
    window.warn('TCL: render -> GameBoard');
    return (
      <div className="gameboard">
        <div className="gameboard-background"></div>
        <div className="gameboard-wrapper">
          <div className="gameboard-board">
            <DndProvider backend={HTML5Backend}>
            {this.boardRef.current && <UnitsWrapper unitComponents={this.props.unitComponents} onLifecycle={this.props.onLifecycle} boardRef={this.boardRef} />}
              <div ref={this.boardRef}>
                {gameBoard.map((boardRow, index) => {
                  return (
                    <div className="gameboard-board-row" key={index}>
                      {boardRow.map(cellPosition => {
                        return <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}></BoardSquare>;
                      })}
                    </div>
                  );
                })}
              </div>
            </DndProvider>
          </div>
        </div>
      </div>
    );
  }
}

export default GameBoard;
