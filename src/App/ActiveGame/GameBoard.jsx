import _ from 'lodash';
import React from 'react';
import BoardSquare from './GameBoard/BoardSquare.jsx';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Position from '../../shared/Position';
import Unit from '../../objects/Unit';

const gameBoardWidth = 8;
const gameBoardHeight = 8;

class GameBoard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gameBoard: this.createGameBoard(gameBoardHeight, gameBoardWidth),
      isMounted: false,
      units: {},
    };
  }

  static getDerivedStateFromProps(props, current_state) {
    if (!_.isEqual(current_state.units, props.units)) {
      console.log("TCL: GameBoard -> getDerivedStateFromProps -> props.units", props.units)
      return {
        units: props.units,
      }
    }

    return null
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

  getHandRow() {
    const handRow = [];
    for (let x = 0; x < gameBoardWidth; x++) {
      handRow.push(new Position(x, -1));
    }

    return (
      <div className="gameboard-board-row">
        {handRow.map(cellPosition => {
          return (
            <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
            </BoardSquare>
          );
        })}
      </div>
    );
  }

  render() {
    const { gameBoard, isMounted, units } = this.state;
    return (
      <div className="gameboard">
        <div className="gameboard-background"></div>
        <div className="gameboard-wrapper">
          <div className="gameboard-board">
            <DndProvider backend={HTML5Backend}>
            {isMounted &&
              units.map(unit => (
                <Unit
                  key={unit.id}
                  unit={unit}
                  getBoardBoundingClientRect={this.getBoardBoundingClientRect.bind(this)}
                  gameBoardWidth={gameBoardWidth}
                  gameBoardHeight={gameBoardHeight}
                  onLifecycle={this.props.onLifecycle}
                />
              ))}
              <div ref={e => (this.boardRef = e)}>
                {gameBoard.map((boardRow, index) => {
                  return (
                    <div className="gameboard-board-row" key={index}>
                      {boardRow.map(cellPosition => {
                        return (
                          <BoardSquare key={cellPosition.toBoardPosition()} cellPosition={cellPosition}>
                          </BoardSquare>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              {this.getHandRow()}
            </DndProvider>
          </div>
        </div>
      </div>
    );
  }
}

export default GameBoard;
