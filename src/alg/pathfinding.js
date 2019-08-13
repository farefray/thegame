const EasyStar = require('easystarjs');

/**
 * Board example
 [ [ 0, 0, 0, 0, 0, 0, 0, 0 ], 
  [ 0, 0, 0, 0, 0, 0, 0, 0 ], 
  [ 0, 0, 0, 0, 0, 0, 0, 0 ], 
  [ 0, 0, 0, 0, 0, 0, 0, 0 ], 
  [ 0, 0, 0, 0, 0, 0, 0, 0 ], 
  [ 0, 0, 0, 0, 0, 0, 0, 0 ], 
  [ 0, 0, 0, 0, 0, 0, 0, 0 ], 
  [ 0, 0, 0, 0, 0, 0, 0, 0 ] ] 
 */
const 
const pathFinding = () => {
  const easystar = new EasyStar.js();

  this.board = [];
  this.loadBoard = function (board) {
    
  };

  var grid = createGrid(8, 8);
easystar.setGrid(grid);

var arrayOfAcceptableTiles = [0];
easystar.setAcceptableTiles(arrayOfAcceptableTiles);
easystar.findPath(1, 1, 5, 5, (path) => {
  path
});
easystar.calculate();

  return this;
}

