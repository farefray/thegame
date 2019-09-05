import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Position from '../../objects/Position';
import Pawn from './GameBoard/Pawn';
import Unit from '../../objects/Unit';

const gameBoardWidth = 8;
const gameBoardHeight = 9;

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

  createGameBoard(height, width) {
    let data = [];
    for (let i = 0; i < height; i++) {
      data[i] = [];
      for (let j = 0; j < width; j++) {
        data[i][j] = new Position(j, width - i);
      }
    }

    return data;
  }

  getBoardBoundingClientRect() {
    return this.boardRef && this.boardRef.getBoundingClientRect();
  }

  render() {
    const { board, onLifecycle, units } = this.props;
    const { gameBoard, isMounted } = this.state;

    return (
      <div className="board-container rpgui-container framed">
        <div className="flex center board" ref={e => (this.boardRef = e)}>
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
            {gameBoard.map((boardColumn, index) => {
              return (
                <div className="board-column" key={index}>
                  {boardColumn.map(cellPosition => {
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
          </DndProvider>
        </div>
      </div>
    );
  }
}

export default GameBoard;
