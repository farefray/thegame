import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Position from '../../objects/Position';
import Pawn from './GameBoard/Pawn';
import Unit from '../../objects/Unit';

const gameBoardWidth = 8;
const gameBoardHeight = 8;

class GameBoard extends React.Component {
  constructor(props) {
    super(props);

    this.isInitialLoad = true;
    this.state = {
      gameBoard: this.createGameBoard(gameBoardHeight, gameBoardWidth),
      isMounted: false
    };
  }

  componentDidMount() {
    this.setState({ isMounted: true });
  }

  createGameBoard(width, height) {
    let data = [];
    for (let y = height - 1; y >= 0; y--) {
      const rowData = [];
      for (let x = 0; x < width; x++) {
        rowData.push(new Position(x, y));
      }
      data.push(rowData);
    }

    return data;
  }

  getBoardBoundingClientRect() {
    return this.boardRef && this.boardRef.getBoundingClientRect();
  }

  getHandRow(board) {
    const handRow = [];
    for (let x = 0; x < gameBoardWidth; x++) {
      handRow.push(new Position(x));
    }
    return (
      <div className="board-row">
        {handRow.map(cellPosition => {
          const creature = board[cellPosition.toBoardPosition()];
          return (
            <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
              {cellPosition.toBoardPosition()}
              {!!creature && <Pawn cellPosition={cellPosition} idle={true} name={creature.name} direction={creature.team === 1 ? 3 : 1} />}
            </BoardSquare>
          );
        })}
      </div>
    );
  }

  render() {
    const { board, onLifecycle, units } = this.props;
    const { gameBoard, isMounted } = this.state;
    return (
      <div className="board-container rpgui-container framed">
        <div className="flex center board">
          {isMounted &&
            units.map(unit => (
              <Unit
                key={unit.id}
                unit={unit}
                getBoardBoundingClientRect={this.getBoardBoundingClientRect.bind(this)}
                gameBoardWidth={gameBoardWidth}
                gameBoardHeight={gameBoardHeight}
                onLifecycle={onLifecycle}
              />
            ))}
          <DndProvider backend={HTML5Backend}>
            <div className="main-board-container" ref={e => (this.boardRef = e)}>
              {gameBoard.map((boardRow, index) => {
                return (
                  <div className="board-row" key={index}>
                    {boardRow.map(cellPosition => {
                      const creature = board[cellPosition.toBoardPosition()];
                      return (
                        <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
                          {cellPosition.toBoardPosition()}
                          {!!creature && <Pawn cellPosition={cellPosition} idle={true} name={creature.name} direction={creature.team === 1 ? 3 : 1} />}
                        </BoardSquare>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {this.getHandRow(board)}
          </DndProvider>
        </div>
      </div>
    );
  }
}

export default GameBoard;
