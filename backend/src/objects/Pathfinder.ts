import { getDistanceBetweenCoordinates } from '../utils/pathUtils';
import Step from './Pathfinder/Step';
import { Position } from './Position';
import BinaryHeap from './Pathfinder/BinaryHeap';

/* Normalize number value to -1, 0 or 1 */
const normalize = number => number < 0 ? -1 : (number > 0 ? 1 : 0);

function heuristic(pos0, pos1) { // switch to getDistanceBetweenCoordinates
  var d1 = Math.abs(pos1.x - pos0.x);
  var d2 = Math.abs(pos1.y - pos0.y);
  return d1 + d2;
}

function getHeap() {
  return new BinaryHeap(function(node) {
    return node.f;
  });
}

class Node {
  x: number;
  y: number;
  f = 0; // total cost of the node = g + h
  g = 0; // distance between the current node and the start node
  h = 0; // heuristic - estimated distance from current node to the end node
  visited = false;
  closed = false;
  parentNode = null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}


export default class Pathfinder {
  private _occupiedTileSet = new Set();
  private dirtyNodes: Array<Node>;
  private gridWidth: number;
  private gridHeight: number;
  private grid;

  constructor(gridWidth = 8, gridHeight = 8) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    const grid: Array<Node[]> = [];
    for (let x = 0; x < this.gridWidth; x++) {
      grid.push([]);
      for (let y = 0; y < this.gridHeight; y++) {
        grid[x].push(new Node(x, y));
      }
    }

    this.grid = grid;
    this.dirtyNodes = [];
  }

  /**
   * Marks tile of unit as taken
   */
  taken(pos: Position) {
    this._occupiedTileSet.add(`${pos.x},${pos.y}`);
  }

  /**
   * ~ as free
   */
  free(pos: Position) {
    this._occupiedTileSet.delete(`${pos.x},${pos.y}`);
  }

  isTaken(pos: Position) {
    return this._occupiedTileSet.has(`${pos.x},${pos.y}`)
  }

  cleanNode(node) {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.visited = false;
    node.closed = false;
    node.parent = null;
  }

  cleanDirty() {
    for (let i = 0; i < this.dirtyNodes.length; i++) {
      this.cleanNode(this.dirtyNodes[i]);
    }

    this.dirtyNodes = [];
  }

  markDirty(node) {
    this.dirtyNodes.push(node);
  }

  getFirstStepInValidPath(unit, target, closest = true) {
    this.cleanDirty();

    const openHeap = getHeap();
    const startNode:Node = this.grid[unit.x][unit.y];
    let closestNode = startNode;  // set the start node to be the closest if required

    closestNode.h = heuristic(startNode, target);
    this.markDirty(startNode);

    openHeap.push(startNode);

    let currentNode;
    while (openHeap.size() > 0) {
      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path
      if (Pathfinder.getDistanceBetweenUnits(currentNode, target) < unit.attackRange) {
        // return pathTo(currentNode); ??
        let node = currentNode;
        const stepArray: Array<any> = [];
        while (node.parent) {
          stepArray.push(node);
          node = node.parent;
        }

        // returning only first step (todo make it store all the path)
        const step = stepArray[stepArray.length - 1];
        return new Step({
          x: step.x - unit.x,
          y: step.y - unit.y
        });
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node. Todo? find diagonal neighbors as well.
      const neighbors = this.getGridNeighbours({
        x: currentNode.x,
        y: currentNode.y
      }).map(step => this.grid[currentNode.x + step.x][currentNode.y + step.y]);

      for (const neighbor of neighbors) {
        if (neighbor.closed) {
          // not a valid node to process, skip to next neighbor
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        const gScore = currentNode.g + 1; // consider using neighbor.getCost(currentNode) to count diagonal and mods
        const beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {
          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor, target);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          this.markDirty(neighbor);
          if (closest) {
            // If the neighbour is closer than the current closestNode or if it's equally close but has
            // a cheaper path than the current closest node then it becomes the closest node
            if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
              closestNode = neighbor;
            }
          }

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    if (closest) {
      // return pathTo(closestNode);
      let node = currentNode;
      const stepArray: Array<any> = [];
      while (node.parent) {
        stepArray.push(node);
        node = node.parent;
      }

      // returning only first step (todo make it store all the path)
      const step = stepArray[stepArray.length - 1];
      return new Step({
        x: step.x - unit.x,
        y: step.y - unit.y
      });
    }

    return null;
  }

  findStepToTarget(unit, targetUnit) {
    const aStarStep = this.getFirstStepInValidPath(unit, targetUnit);
    if (aStarStep) {
      return {
        x: aStarStep.x,
        y: aStarStep.y
      };
    }

    // todo make this human readable
    const possibleSteps = this.getUnitPossibleSteps(unit);
    if (!possibleSteps.length) return new Step();

    const distance = {
      x: Math.abs(targetUnit.x - unit.x),
      y: Math.abs(targetUnit.y - unit.y)
    };

    const normalizedDistance = {
      x: normalize(targetUnit.x - unit.x),
      y: normalize(targetUnit.y - unit.y)
    };

    const preferredAxis = distance.x > distance.y ? 'x' : 'y';
    const secondaryAxis = preferredAxis === 'x' ? 'y' : 'x';

    const modifiers = [{
      [preferredAxis]: normalizedDistance[preferredAxis],
      resistance: -20
    },
    {
      [preferredAxis]: normalizedDistance[preferredAxis] * -1,
      resistance: 20
    },
    {
      [secondaryAxis]: normalizedDistance[secondaryAxis],
      resistance: -10
    },
    {
      [secondaryAxis]: normalizedDistance[secondaryAxis] * -1,
      resistance: 10
    }
    ];

    const {
      previousStep
    } = unit;
    if (previousStep) {
      modifiers.push({
        x: previousStep.x,
        y: previousStep.y,
        resistance: -5
      });
    }
    possibleSteps.forEach(step => step.applyModifiers(modifiers));
    const lowestResistance = Math.min(...possibleSteps.map(step => step.resistance));
    const optimalSteps = possibleSteps.filter(step => step.resistance === lowestResistance);
    if (optimalSteps.length === 1) {
      return new Step({
        x: optimalSteps[0].x,
        y: optimalSteps[0].y
      });
    }

    const optimalStep = possibleSteps.reduce((previous, current) => (previous.resistance > current.resistance ? current : previous));

    return {
      x: optimalStep.x,
      y: optimalStep.y
    };
  }

  getUnitPossibleSteps(unit) {
    return [new Step({
      x: 0,
      y: -1
    }), new Step({
      x: 0,
      y: 1
    }), new Step({
      x: -1,
      y: 0
    }), new Step({
      x: 1,
      y: 0
    })].filter(step => {
      const isOutOfBounds = unit.x + step.x < 0 || unit.x + step.x >= this.gridWidth || unit.y + step.y < 0 || unit.y + step.y >= this.gridHeight;
      if (isOutOfBounds) return false;
      if (this.isTaken({
        x: unit.x + step.x,
        y: unit.y + step.y
      })) return false;
      return true;
    });
  }

  /**
   * Returning possible nearby directions(N/W/S/E) coordinates based on tile coordinates
   */
  getGridNeighbours({ x, y }: { x: number, y: number }): Array<Position> {
    return [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -0, y: 1 }]
      .filter(step => {
        const isOutOfBounds = x + step.x < 0 || x + step.x >= this.gridWidth || y + step.y < 0 || y + step.y >= this.gridHeight;
        if (isOutOfBounds) return false;
        if (this.isTaken({
          x: x + step.x,
          y: y + step.y
        })) return false;
        return true;
      });
  }

  /**
   * @param {BattleUnit|Pathobject?} unit1
   * @param {BattleUnit} unit2
   * @returns {Integer}
   */
  static getDistanceBetweenUnits(unit1, unit2) {
    return getDistanceBetweenCoordinates({
      x: unit1.x,
      y: unit1.y,
      x2: unit2.x,
      y2: unit2.y
    });
  }

  static findInsertionIndex(stepArray, step) {
    let min = 0;
    let max = stepArray.length;
    while (min < max) {
      const mid = (min + max) >>> 1;
      if (stepArray[mid].f < step.f) {
        min = mid + 1;
      } else {
        max = mid;
      }
    }
    return min;
  }
}