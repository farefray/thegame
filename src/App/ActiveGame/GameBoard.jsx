import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd';
// import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';

import Position from '../../shared/Position';

class GameBoard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameBoard: this.createGameBoard(props.width, props.height)
    };

    this.boardRef = React.createRef();
  }

  componentDidMount() {}

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

  render() {
    const { gameBoard } = this.state;
    return (
          <div className="gameboard-board">
            <DndProvider backend={TouchBackend} options={{
              enableMouseEvents: true
            }}>
              <div ref={this.boardRef}>

                {this.props.render(this.boardRef)}

                {gameBoard.map((boardRow, index) => {
                  return (
                    <div className="gameboard-board-row" key={index}>
                      {boardRow.map((cellPosition) => {
                        return (
                          <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
                            {process.env.REACT_APP_GAMEMODE ? cellPosition.toBoardPosition() : ''}
                          </BoardSquare>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </DndProvider>
          </div>
    );
  }
}

export default GameBoard;
