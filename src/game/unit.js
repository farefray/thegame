const f = require('../f');


const UnitJS = {};

/** Private methods */

function _getLowestKey(openSet, heuristicMap) {
  const iter = openSet.keys();
  let temp = iter.next();
  let lowestIndex = temp.value;
  let lowestValue = heuristicMap.get(lowestIndex);
  while (!temp.done) {
    const key = temp.value;
    const value = heuristicMap.get(key);
    if (value < lowestValue) {
      lowestValue = value;
      lowestIndex = key;
    }
    temp = iter.next();
  }
  return lowestIndex;
}

function _getHeuristicScore(unitPos, closestEnemyPos) {
  const x = f.x(closestEnemyPos);
  const y = f.y(closestEnemyPos);
  const ux = f.x(unitPos);
  const uy = f.y(unitPos);
  return Math.floor(((uy - y) ** 2) + ((ux - x) ** 2));
}

function _allowedCoordinate(board, pos) {
  const x = f.x(pos);
  const y = f.y(pos);
  return f.isUndefined(board[pos]) && x >= 0 && x < 8 && y >= 0 && y < 8;
}

/**
 * Get first available spot at max range away from closest enemy
 * spot that is at maximal possible range from enemy, otherwise closer
 * Different favorable positions for S and N team, prioritize your side movement
 * (Assasins functionality can use enemyTeam as input)
 */
function _getMovePos(board, closestEnemyPos, range, team) {
  const x = f.x(closestEnemyPos);
  const y = f.y(closestEnemyPos);
  for (let i = range; i >= 1; i--) {
    if (team === 0) { // S team
      if (_allowedCoordinate(board, f.pos(x, y - i))) { // S
        return f.pos(x, y - i);
      } if (_allowedCoordinate(board, f.pos(x - i, y - i))) { // SW
        return f.pos(x - i, y - i);
      } if (_allowedCoordinate(board, f.pos(x + i, y - i))) { // SE
        return f.pos(x + i, y - i);
      } if (_allowedCoordinate(board, f.pos(x - i, y))) { // W
        return f.pos(x - i, y);
      } if (_allowedCoordinate(board, f.pos(x + i, y))) { // E
        return f.pos(x + i, y);
      } if (_allowedCoordinate(board, f.pos(x, y + i))) { // N
        return f.pos(x, y + i);
      } if (_allowedCoordinate(board, f.pos(x - i, y + i))) { // NW
        return f.pos(x - i, y + i);
      } if (_allowedCoordinate(board, f.pos(x + i, y + i))) { // NE
        return f.pos(x + i, y + i);
      }
    } else { // N team
      if (_allowedCoordinate(board, f.pos(x, y + i))) { // N
        return f.pos(x, y + i);
      } if (_allowedCoordinate(board, f.pos(x + i, y + i))) { // NE
        return f.pos(x + i, y + i);
      } if (_allowedCoordinate(board, f.pos(x - i, y + i))) { // NW
        return f.pos(x - i, y + i);
      } if (_allowedCoordinate(board, f.pos(x + i, y))) { // E
        return f.pos(x + i, y);
      } if (_allowedCoordinate(board, f.pos(x - i, y))) { // W
        return f.pos(x - i, y);
      } if (_allowedCoordinate(board, f.pos(x, y - i))) { // S
        return f.pos(x, y - i);
      } if (_allowedCoordinate(board, f.pos(x + i, y - i))) { // SE
        return f.pos(x + i, y - i);
      } if (_allowedCoordinate(board, f.pos(x - i, y - i))) { // SW
        return f.pos(x - i, y - i);
      }
    }
  }
  // TODO: if no spot available, move closer to enemy?
  // Temp: no move
  return f.pos();
}

function _getDirection(unitPos, path) {
  const ux = f.x(unitPos);
  const uy = f.y(unitPos);
  const tx = f.x(path);
  const ty = f.y(path);
  const y = (ty - uy);
  const x = (tx - ux);
  let sx = '';
  let sy = '';
  if (x !== 0) {
    let type = 'W';
    if (x > 0) {
      type = 'E';
    }
    sx = Math.abs(x) + type;
  }
  if (y !== 0) {
    let type = 'S';
    if (y > 0) {
      type = 'N';
    }
    sy = Math.abs(y) + type;
  }
  return sy + sx;
}

function _handleNeighbor(pathFindParam, board, current, enemyPos, pos) {
  let pathFind = pathFindParam;
  if (pathFind.get('visited').has(pos)) {
    // console.log('@Path @handleNeighbor Visited', pos)
    return pathFind;
  }
  if (!_allowedCoordinate(board, pos) && pos !== enemyPos) { // Taken already
    // console.log('@Path @handleNeighbor Spot taken', pos, (board[pos] ? board[pos].get('name') : ''));
    return pathFind;
  }
  const distanceTraveled = pathFind.getIn(['fromStartScore', current]) + 1;
  // console.log('@Path @handleNeighbor', pos, pathFind.get('toVisit')) // !pathFind.get('toVisit').has(pos), pathFind.get('toVisit').has(pos),
  // console.log('@Path fromStartScore', distanceTraveled, pathFind.getIn(['fromStartScore', pos]));
  if (!pathFind.get('toVisit').has(pos)) { // New visited node
    pathFind = pathFind.set('toVisit', pathFind.get('toVisit').add(pos));
  } else if (distanceTraveled >= (pathFind.getIn(['fromStartScore', pos]) || 0)) { // Not a better option
    return pathFind;
  }
  // console.log('@Path Path Recorded')
  // Record path
  const heuristicScore = distanceTraveled + _getHeuristicScore(pos, enemyPos);
  return pathFind.setIn(['cameFrom', pos], current).setIn(['fromStartScore', pos], distanceTraveled).setIn(['heuristicScore', pos], heuristicScore);
}


UnitJS.getStepMovePos = async (board, unitPos, closestEnemyPos, range, team, exceptionsList = []) => {
  const stepsToTake = Math.floor(Math.random() * 2 + 1); // 1 currently //  1 - 2, * 2
  console.log(unitPos, closestEnemyPos);
  const rangeToTarget = _getHeuristicScore(unitPos, closestEnemyPos);
  if (stepsToTake > rangeToTarget) { // Within range, move to closest available space // && rangeToTarget === 1
    const goal = _getMovePos(board, closestEnemyPos, 1, team);
    const direction = _getDirection(unitPos, goal);
    // console.log('Move direction: ', direction);
    return { movePos: goal, direction };
  } // More TOWARDS unit with stepsToTake amount of steps

  const fromStartScore = {};
  fromStartScore[unitPos] = 0;
  const heuristicScore = {};
  heuristicScore[unitPos] = rangeToTarget;
  let pathFind = {
    fromStartScore, // gScore
    heuristicScore, // fScore
    toVisit: [unitPos], // openSet
    visited: [], // closedSet
    cameFrom: {}, // cameFrom
  };
    // console.log('@Path Start', unitPos, closestEnemyPos);
  while (pathFind['toVisit'].length > 0) {
    // console.log('@Path ToVisit: ', pathFind.get('toVisit'))
    const current = _getLowestKey(pathFind['toVisit'], pathFind['heuristicScore']);
    if (current === closestEnemyPos) {
      let cameFrom = current;
      let path = [];
      while (cameFrom !== unitPos) {
        cameFrom = pathFind['cameFrom'][cameFrom];
        path = path.unshift(cameFrom);
      }
      if (path.length <= 1) {
        console.log('Shouldnt get here @path goal');
      } else {
        let index;
        if (path.length <= stepsToTake) {
          index = path.length - 1;
        } else {
          index = stepsToTake;
        }
        // console.log('Finished Path Finding! Return Path[' + index + ']:', path.get(index), path);
        const direction = _getDirection(unitPos, path[index]);
        // console.log('Move direction: ', direction);
        return { movePos: path[index], direction };
      }
    }
    console.log('@Path Current', current);
    pathFind.set('toVisit', pathFind.get('toVisit').delete(current)).set('visited', pathFind.get('visited').add(current));
    console.log('@Path Visited', pathFind.get('visited'));

    const ux = f.x(current);
    const uy = f.y(current);

    pathFind = await _handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux, uy + 1)); // N
    pathFind = await _handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux, uy - 1)); // S
    pathFind = await _handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux + 1, uy)); // E
    pathFind = await _handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux - 1, uy)); // W
    pathFind = await _handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux - 1, uy - 1)); // NW
    pathFind = await _handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux + 1, uy - 1)); // NE
    pathFind = await _handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux - 1, uy + 1)); // SW
    pathFind = await _handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux + 1, uy + 1)); // SE
  }
  const newClosestEnemyObj = UnitJS.getClosestEnemy(board, unitPos, range, team, exceptionsList.push(closestEnemyPos));
  if (f.isUndefined(newClosestEnemyObj.get('closestEnemy'))) {
    console.log('DIDNT FIND PATH. RETURNING ', unitPos);
    return { movePos: unitPos, direction: '' };
  }
  // TODO: Check so not blocked in
  console.log(`No path available to piece, ${closestEnemyPos} from ${unitPos} (Range: ${range}). Going deeper`);
  return UnitJS.getStepMovePos(board, unitPos, newClosestEnemyObj.get('closestEnemy'), range, team, exceptionsList.push(closestEnemyPos));
};

/**
 * Deletes all entries for a unit so allowed same move cant be used to attack those units
 * If a unit dies, the people that previously attacked that unit have to select new target
 */
UnitJS.deleteNextMoveResultEntries = async (unitMoveMapParam, targetToRemove) => {
  // console.log('@deleteNextMoveResultEntries', targetToRemove)
  let unitMoveMap = unitMoveMapParam;
  for (const key in unitMoveMap) {
    const tempPrevMove = unitMoveMap.get(key);
    const target = tempPrevMove['nextMove']['target'];
    const invalidPrevTarget = targetToRemove;
    if (f.x(target) === f.x(invalidPrevTarget) && f.y(target) === f.y(invalidPrevTarget)) {
      delete unitMoveMap[tempPrevMove];
    }
  }
  delete unitMoveMap[targetToRemove];
  return unitMoveMap;
};

module.exports = UnitJS;
