

const {
  Map, List, Set, fromJS,
} = require('immutable');

const pawns = require('./pawns');
const f = require('./f');
const typesJS = require('./types');
const gameConstantsJS = require('./game_constants');
const abilitiesJS = require('./abilities');
const shopJS = require('./game/shop');
const BattleJS = require('./game/battle');
const StateJS = require('./game/state');
const BattlefieldJS = require('./game/battlefield');

// Cost of 2 gold(todo check for balance?)
exports.refreshShopGlobal = async (stateParam, index) => {
  const state = stateParam.setIn(['players', index, 'gold'], stateParam.getIn(['players', index, 'gold']) - 2);
  return shopJS.refreshShop(state, index);
};

/**
 * Create unit for board/hand placement from name and spawn position
 */
async function getBoardUnit(name, x, y) {
  const unitInfo = await pawns.getStats(name);
  if (f.isUndefined(unitInfo)) console.log('UNDEFINED:', name);
  // console.log('@getBoardUnit', name, unitInfo)
  let unit = Map({
    name,
    displayName: unitInfo.get('displayName'),
    position: f.pos(x, y),
    type: unitInfo.get('type'),
  });
  if (unitInfo.get('reqEvolve')) {
    unit = unit.set('reqEvolve', unitInfo.get('reqEvolve'));
  }
  return unit;
}

/**
 * Help function in creating battle boards
 * Use together with combine boards
 */
exports.createBattleBoard = async (inputList) => {
  let board = Map({});
  for (let i = 0; i < inputList.size; i++) {
    const el = inputList.get(i);
    const pokemon = el.get('name');
    const x = el.get('x');
    const y = el.get('y');
    const unit = await getBoardUnit(pokemon, x, y);
    board = await board.set(f.pos(x, y), unit);
  }
  return board;
};



/**
 * *Assumed hand not full here
 * *Assumed can afford
 * Remove unit from shop
 * Add unit to hand
 * Remove money from player
 *  Amount of money = getUnit(unitId).cost
 */
exports.buyUnit = async (stateParam, playerIndex, unitID) => {
  let state = stateParam;
  // console.log('@buyunit', unitID, playerIndex, f.pos(unitID));
  // console.log(state.getIn(['players', playerIndex, 'shop']));
  let shop = state.getIn(['players', playerIndex, 'shop']);
  const unit = shop.get(f.pos(unitID)).get('name');
  if (!f.isUndefined(unit)) {
    shop = shop.delete(f.pos(unitID));
    state = state.setIn(['players', playerIndex, 'shop'], shop);

    const hand = state.getIn(['players', playerIndex, 'hand']);
    const unitInfo = await pawns.getStats(unit);
    const handIndex = await StateJS.getFirstAvailableSpot(state, playerIndex); // TODO: Go: Get first best hand index
    // console.log('@buyUnit handIndex', handIndex);
    const unitHand = await getBoardUnit(unit, f.x(handIndex));
    // console.log('@buyUnit unitHand', unitHand)
    state = state.setIn(['players', playerIndex, 'hand'], hand.set(unitHand.get('position'), unitHand));

    const currentGold = state.getIn(['players', playerIndex, 'gold']);
    state = state.setIn(['players', playerIndex, 'gold'], currentGold - unitInfo.get('cost'));
    state = state.setIn(['players', playerIndex, 'unitAmounts', unit], (state.getIn(['players', playerIndex, 'unitAmounts', unit]) || 0) + 1);
  }
  return state;
};


/**
 * toggleLock for player (setIn)
 */
exports.toggleLock = async (state, playerIndex) => {
  const locked = state.getIn(['players', playerIndex, 'locked']);
  if (!locked) {
    return state.setIn(['players', playerIndex, 'locked'], true);
  }
  return state.setIn(['players', playerIndex, 'locked'], false);
};

async function increaseExp(stateParam, playerIndex, amountParam) {
  let state = stateParam;
  let player = state.getIn(['players', playerIndex]);
  let level = player.get('level');
  let exp = player.get('exp');
  let expToReach = player.get('expToReach');
  let amount = amountParam;
  if (level === 10) return state;
  while (amount >= 0) {
    // console.log('increaseExp', level, exp, expToReach)
    // console.log(exp, level, expToReach, amount, expToReach > exp + amount);
    if (expToReach > exp + amount) { // not enough exp to level up
      exp += amount;
      amount = 0;
      player = player.set('level', level);
      player = player.set('exp', exp);
      player = player.set('expToReach', expToReach);
      state = state.setIn(['players', playerIndex], player);
      break;
    } else { // Leveling up
      level += 1;
      if (level === 10) {
        player = player.set('level', level);
        player = player.set('exp', 0);
        player = player.set('expToReach', 'max');
        state = state.setIn(['players', playerIndex], player);
        break;
      }
      amount -= expToReach - exp;
      expToReach = gameConstantsJS.getExpRequired(level);
      // 2exp -> 4 when +5 => lvlup +3 exp: 5 = 5 - (4 - 2) = 5 - 2 = 3
      exp = 0;
    }
  }
  // console.log('increaseExp leaving', level, exp, expToReach)
  return state;
}

/**
 * Buy exp for player (setIn)
 */
exports.buyExp = (state, playerIndex) => {
  const gold = state.getIn(['players', playerIndex, 'gold']);
  const newState = state.setIn(['players', playerIndex, 'gold'], gold - 5);
  return increaseExp(newState, playerIndex, 4);
};


/**
 * Board interaction
 * On move: reset the ids to index
 */

/**
  * Checks all units on board for player of that piece type
  * if 3 units are found, remove those 3 units and replace @ position with evolution
  * No units are added to discardedPieces
  */
async function checkPieceUpgrade(stateParam, playerIndex, piece, position) {
  let state = stateParam;
  const boardUnits = state.getIn(['players', playerIndex, 'board']);
  const name = piece.get('name');
  const stats = await pawns.getStats(name);
  if (f.isUndefined(stats.get('evolves_to'))) return Map({ state, upgradeOccured: false });
  let pieceCounter = 0;
  let positions = List([]);
  const keysIter = boardUnits.keys();
  let tempUnit = keysIter.next();
  while (!tempUnit.done) {
    const unit = boardUnits.get(tempUnit.value);
    if (unit.get('name') === name) {
      pieceCounter += 1;
      positions = positions.push(unit.get('position'));
      // TODO: Check for bug buff here (baby pkmns)
    }
    tempUnit = keysIter.next();
  }
  let requiredAmount = 3;
  if (piece.get('reqEvolve')) {
    requiredAmount = piece.get('reqEvolve');
    console.log('LESS UNITS REQUIRED FOR UPGRADE', piece.get('name'), requiredAmount);
  }
  if (pieceCounter >= requiredAmount) { // Upgrade unit @ position
    // console.log('UPGRADING UNIT', name);
    let board = state.getIn(['players', playerIndex, 'board']);
    let discPieces = state.get('discardedPieces');
    for (let i = 0; i < positions.size; i++) {
      const unit = board.get(positions.get(i));
      discPieces = discPieces.push(unit.get('name'));
      board = board.delete(positions.get(i));
    }
    state = state.set('discardedPieces', discPieces);
    state = state.setIn(['players', playerIndex, 'board'], board);
    const evolvesUnit = stats.get('evolves_to');
    let evolvesTo = evolvesUnit;
    if (!f.isUndefined(evolvesTo.size)) { // List
      evolvesTo = evolvesUnit.get(f.getRandomInt(evolvesTo.size));
    }
    // Check if multiple evolutions exist, random between
    const newPiece = await getBoardUnit(evolvesTo, f.x(position), f.y(position));
    state = state.setIn(['players', playerIndex, 'board', position], newPiece);
    // TODO: List -> handle differently
    const evolutionDisplayName = (await pawns.getStats(evolvesTo)).get('displayName');
    // console.log('evolutionDisplayName', evolutionDisplayName);
    const nextPieceUpgrade = await checkPieceUpgrade(state, playerIndex, newPiece, position);
    // Get both upgrades
    return nextPieceUpgrade.set('upgradeOccured', List([evolutionDisplayName]).concat(nextPieceUpgrade.get('upgradeOccured') || List([])));
  }
  return Map({ state, upgradeOccured: false });
}

exports.placePieceGlobal = async (stateParam, playerIndex, fromPosition, toPosition, shouldSwap = 'true') => BattlefieldJS.placePiece(stateParam, playerIndex, fromPosition, toPosition, shouldSwap);

exports.withdrawPieceGlobal = async (state, playerIndex, piecePosition) => BattleJS.withdrawPiece(state, playerIndex, piecePosition);

/**
 * When units are sold, when level 1, a level 1 unit should be added to discardedPieces
 * Level 2 => 3 level 1 units, Level 3 => 9 level 1 units
 */
async function discardBaseUnits(stateParam, playerIndex, name, depth = 1) {
  let state = stateParam;
  const unitStats = await pawns.getStats(name);
  const evolutionFrom = unitStats.get('evolves_from');
  // console.log('@discardBaseUnits start', name, depth);
  if (f.isUndefined(evolutionFrom)) { // Base level
    let discPieces = state.get('discardedPieces');
    const amountOfPieces = 3 ** (depth - 1); // Math.pow
    console.log('@discardBaseUnits', amountOfPieces, depth, name);
    for (let i = 0; i < amountOfPieces; i++) {
      discPieces = discPieces.push(name);
    }
    const unitAmounts = state.getIn(['players', playerIndex, 'unitAmounts']);
    if(unitAmounts) {
      const newValue = unitAmounts.get(name) - amountOfPieces;
      if(newValue === 0) {
        state = state.setIn(['players', playerIndex, 'unitAmounts'], unitAmounts.delete(name));
      } else {
        state = state.setIn(['players', playerIndex, 'unitAmounts', name], newValue);
      }
    }
    return state.set('discardedPieces', (await discPieces));
  }
  const newName = evolutionFrom;
  // console.log('@discardBaseUnits', newName, depth);
  return discardBaseUnits(state, playerIndex, newName, depth + 1);
}

/**
 * Sell piece
 * Increase money for player
 * Remove piece from position
 * add piece to discarded pieces
 */
async function sellPiece(state, playerIndex, piecePosition) {
  let pieceTemp;
  if (f.checkHandUnit(piecePosition)) {
    pieceTemp = state.getIn(['players', playerIndex, 'hand', piecePosition]);
  } else {
    pieceTemp = state.getIn(['players', playerIndex, 'board', piecePosition]);
  }
  const piece = pieceTemp;
  const unitStats = await pawns.getStats(piece.get('name'));
  const cost = unitStats.get('cost');
  const gold = state.getIn(['players', playerIndex, 'gold']);
  let newState = state.setIn(['players', playerIndex, 'gold'], +gold + +cost);
  if (f.checkHandUnit(piecePosition)) {
    const unitToSell = newState.getIn(['players', playerIndex, 'hand', piecePosition]);
    const newHand = newState.getIn(['players', playerIndex, 'hand']).delete(piecePosition);
    const newDiscardedPieces = newState.set('discardedPieces', newState.get('discardedPieces').push(unitToSell.get('name')));
    newState = newDiscardedPieces.setIn(['players', playerIndex, 'hand'], newHand);
  } else {
    const unitToSell = newState.getIn(['players', playerIndex, 'board', piecePosition]);
    const newBoard = newState.getIn(['players', playerIndex, 'board']).delete(piecePosition);
    const newDiscardedPieces = newState.set('discardedPieces', newState.get('discardedPieces').push(unitToSell.get('name')));
    newState = newDiscardedPieces.setIn(['players', playerIndex, 'board'], newBoard);
  }
  // Add units to discarded Cards, add base level of card
  return discardBaseUnits(newState, playerIndex, piece.get('name'));
}

exports.sellPieceGlobal = (state, playerIndex, piecePosition) => sellPiece(state, playerIndex, piecePosition);

function allowedCoordinate(board, pos) {
  const x = f.x(pos);
  const y = f.y(pos);
  return f.isUndefined(board.get(pos)) && x >= 0 && x < 8 && y >= 0 && y < 8;
}

/**
 * Get first available spot at max range away from closest enemy
 * spot that is at maximal possible range from enemy, otherwise closer
 * Different favorable positions for S and N team, prioritize your side movement
 * (Assasins functionality can use enemyTeam as input)
 */
function getMovePos(board, closestEnemyPos, range, team) {
  const x = f.x(closestEnemyPos);
  const y = f.y(closestEnemyPos);
  for (let i = range; i >= 1; i--) {
    if (team === 0) { // S team
      if (allowedCoordinate(board, f.pos(x, y - i))) { // S
        return f.pos(x, y - i);
      } if (allowedCoordinate(board, f.pos(x - i, y - i))) { // SW
        return f.pos(x - i, y - i);
      } if (allowedCoordinate(board, f.pos(x + i, y - i))) { // SE
        return f.pos(x + i, y - i);
      } if (allowedCoordinate(board, f.pos(x - i, y))) { // W
        return f.pos(x - i, y);
      } if (allowedCoordinate(board, f.pos(x + i, y))) { // E
        return f.pos(x + i, y);
      } if (allowedCoordinate(board, f.pos(x, y + i))) { // N
        return f.pos(x, y + i);
      } if (allowedCoordinate(board, f.pos(x - i, y + i))) { // NW
        return f.pos(x - i, y + i);
      } if (allowedCoordinate(board, f.pos(x + i, y + i))) { // NE
        return f.pos(x + i, y + i);
      }
    } else { // N team
      if (allowedCoordinate(board, f.pos(x, y + i))) { // N
        return f.pos(x, y + i);
      } if (allowedCoordinate(board, f.pos(x + i, y + i))) { // NE
        return f.pos(x + i, y + i);
      } if (allowedCoordinate(board, f.pos(x - i, y + i))) { // NW
        return f.pos(x - i, y + i);
      } if (allowedCoordinate(board, f.pos(x + i, y))) { // E
        return f.pos(x + i, y);
      } if (allowedCoordinate(board, f.pos(x - i, y))) { // W
        return f.pos(x - i, y);
      } if (allowedCoordinate(board, f.pos(x, y - i))) { // S
        return f.pos(x, y - i);
      } if (allowedCoordinate(board, f.pos(x + i, y - i))) { // SE
        return f.pos(x + i, y - i);
      } if (allowedCoordinate(board, f.pos(x - i, y - i))) { // SW
        return f.pos(x - i, y - i);
      }
    }
  }
  // TODO: if no spot available, move closer to enemy?
  // Temp: no move
  return f.pos();
}

function getHeuristicScore(unitPos, closestEnemyPos) {
  const x = f.x(closestEnemyPos);
  const y = f.y(closestEnemyPos);
  const ux = f.x(unitPos);
  const uy = f.y(unitPos);
  return Math.floor(((uy - y) ** 2) + ((ux - x) ** 2));
}

function getLowestKey(openSet, heuristicMap) {
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

function handleNeighbor(pathFindParam, board, current, enemyPos, pos) {
  let pathFind = pathFindParam;
  if (pathFind.get('visited').has(pos)) {
    // console.log('@Path @handleNeighbor Visited', pos)
    return pathFind;
  }
  if (!allowedCoordinate(board, pos) && pos !== enemyPos) { // Taken already
    // console.log('@Path @handleNeighbor Spot taken', pos, (board.get(pos) ? board.get(pos).get('name') : ''));
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
  const heuristicScore = distanceTraveled + getHeuristicScore(pos, enemyPos);
  return pathFind.setIn(['cameFrom', pos], current).setIn(['fromStartScore', pos], distanceTraveled).setIn(['heuristicScore', pos], heuristicScore);
}

function getDirection(unitPos, path) {
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

async function getStepMovePos(board, unitPos, closestEnemyPos, range, team, exceptionsList = List([])) {
  const stepsToTake = Math.floor(Math.random() * 2 + 1); // 1 currently //  1 - 2, * 2
  const rangeToTarget = getHeuristicScore(unitPos, closestEnemyPos);
  if (stepsToTake > rangeToTarget) { // Within range, move to closest available space // && rangeToTarget === 1
    const goal = getMovePos(board, closestEnemyPos, 1, team);
    const direction = getDirection(unitPos, goal);
    // console.log('Move direction: ', direction);
    return Map({ movePos: goal, direction });
  } // More TOWARDS unit with stepsToTake amount of steps
  let pathFind = Map({
    fromStartScore: Map({}).set(unitPos, 0), // gScore
    heuristicScore: Map({}).set(unitPos, rangeToTarget), // fScore
    toVisit: Set([]).add(unitPos), // openSet
    visited: Set([]), // closedSet
    cameFrom: Map({}), // cameFrom
  });
    // console.log('@Path Start', unitPos, closestEnemyPos);
  while (pathFind.get('toVisit').size > 0) {
    // console.log('@Path ToVisit: ', pathFind.get('toVisit'))
    const current = getLowestKey(pathFind.get('toVisit'), pathFind.get('heuristicScore'));
    if (current === closestEnemyPos) {
      let cameFrom = current;
      let path = List([]);
      while (cameFrom !== unitPos) {
        cameFrom = pathFind.getIn(['cameFrom', cameFrom]);
        path = path.unshift(cameFrom);
      }
      if (path.size <= 1) {
        console.log('Shouldnt get here @path goal');
      } else {
        let index;
        if (path.size <= stepsToTake) {
          index = path.size - 1;
        } else {
          index = stepsToTake;
        }
        // console.log('Finished Path Finding! Return Path[' + index + ']:', path.get(index), path);
        const direction = getDirection(unitPos, path.get(index));
        // console.log('Move direction: ', direction);
        return Map({ movePos: path.get(index), direction });
      }
    }
    // console.log('@Path Current', current);
    pathFind = pathFind.set('toVisit', pathFind.get('toVisit').delete(current)).set('visited', pathFind.get('visited').add(current));
    // console.log('@Path Visited', pathFind.get('visited'));

    const ux = f.x(current);
    const uy = f.y(current);

    pathFind = await handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux, uy + 1)); // N
    pathFind = await handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux, uy - 1)); // S
    pathFind = await handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux + 1, uy)); // E
    pathFind = await handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux - 1, uy)); // W
    pathFind = await handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux - 1, uy - 1)); // NW
    pathFind = await handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux + 1, uy - 1)); // NE
    pathFind = await handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux - 1, uy + 1)); // SW
    pathFind = await handleNeighbor(pathFind, board, current, closestEnemyPos, f.pos(ux + 1, uy + 1)); // SE
  }
  const newClosestEnemyObj = getClosestEnemy(board, unitPos, range, team, exceptionsList.push(closestEnemyPos));
  if (f.isUndefined(newClosestEnemyObj.get('closestEnemy'))) {
    console.log('DIDNT FIND PATH. RETURNING ', unitPos);
    return Map({ movePos: unitPos, direction: '' });
  }
  // TODO: Check so not blocked in
  console.log(`No path available to piece, ${closestEnemyPos} from ${unitPos} (Range: ${range}). Going deeper`);
  return getStepMovePos(board, unitPos, newClosestEnemyObj.get('closestEnemy'), range, team, exceptionsList.push(closestEnemyPos));
}

/**
 * return closest enemy and marks if within range or not
 * If someones at spot && its enemy unit
 * Does this handle positioning good for both teams?
 * Map({closestEnemy, withinRange, direction})
 * Current order: SW, NW, S, N, SE, NE, SW, SE, W, E, NW, NE
 * New Current Order: N S W E SW NW SE NE
 * Wanted order:
 *    team 0: N, S, W, E, NW, NE, SW, SE
 *    team 1: S, N, W, E, SW, SE, NW, NE
 */
function getClosestEnemy(board, unitPos, range, team, exceptionsList = List([])) {
  // f.print(board, '@getClosestEnemy board')
  const x = f.x(unitPos);
  const y = f.y(unitPos);
  const enemyTeam = 1 - team;
  let pos;
  f.p('@getClosestEnemy', unitPos, team, range, enemyTeam, board.get(f.pos(x, y)).get('team'));
  // Check N S W E
  pos = f.pos(x, y + 1);
  if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
    return Map({ closestEnemy: pos, withinRange: true, direction: 'N' });
  }
  pos = f.pos(x, y - 1);
  if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
    return Map({ closestEnemy: pos, withinRange: true, direction: 'S' });
  }
  pos = f.pos(x - 1, y);
  if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
    return Map({ closestEnemy: pos, withinRange: true, direction: 'W' });
  }
  pos = f.pos(x + 1, y);
  if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
    return Map({ closestEnemy: pos, withinRange: true, direction: 'E' });
  }

  for (let i = 1; i <= 8; i++) {
    const withinRange = i <= range;
    // console.log(withinRange, x, y, i, (x-i), (y-i))

    // Normal checks
    for (let j = x - i; j <= x + i; j++) {
      pos = f.pos(j, y - i);
      if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
        const direction = getDirection(unitPos, pos);
        return Map({ closestEnemy: pos, withinRange, direction });
      }
      pos = f.pos(j, y + i);
      if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
        const direction = getDirection(unitPos, pos);
        return Map({ closestEnemy: pos, withinRange, direction });
      }
    }
    for (let j = y - i + 1; j < y + i; j++) {
      pos = f.pos(x - i, j);
      if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
        const direction = getDirection(unitPos, pos);
        return Map({ closestEnemy: pos, withinRange, direction });
      }
      pos = f.pos(x + i, j);
      if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
        const direction = getDirection(unitPos, pos);
        return Map({ closestEnemy: pos, withinRange, direction });
      }
    }
  }
  // f.print(board, '@getClosestEnemy Returning undefined: Board\n');
  console.log('@getClosestEnemy Returning undefined: ', x, y, range, team);
  return Map({ closestEnemy: undefined, withinRange: false, direction: '' });
}

/**
 * Remove hp from unit
 * Remove unit if hp <= 0
 * Percent currently not used, hp to remove calculated before hand
 * ({board, unitDied})
 */
async function removeHpBattle(board, unitPos, hpToRemove, percent = false) {
  const currentHp = board.getIn([unitPos, 'hp']);
  // console.log('@removeHpBattle', hpToRemove)
  let newHp = currentHp - hpToRemove;
  if (percent) {
    const maxHp = (await pawns.getStats(board.get(unitPos).get('name'))).get('hp');
    newHp = await Math.round(currentHp - (maxHp * hpToRemove)); // HptoRemove is percentage to remove
  }
  if (newHp <= 0) {
    f.p('@removeHpBattle UNIT DIED!', currentHp, '->', (percent ? `${newHp}(%)` : `${newHp}(-)`));

    return Map({ board: board.delete(unitPos), unitDied: currentHp });
  }
  // Caused a crash0
  if (Number.isNaN(currentHp - hpToRemove)) {
    console.log('Exiting (removeHpBattle) ... ', currentHp, hpToRemove, board.get(unitPos));
    console.log(hpToRemove);
    process.exit();
  }
  return Map({ board: board.setIn([unitPos, 'hp'], newHp), unitDied: false });
}

/**
 * Increases mana for both units on board
 * Returns updated board
 * Supports enemy being dead
 * TODO: Maybe, Load from defaults here, so mana stats don't have to be stored in vain
 */
async function manaIncrease(board, damage, unitPos, enemyPos) {
  let manaChanges = Map({});
  const unitMana = board.get(unitPos).get('mana');
  const unitManaMult = board.get(unitPos).get('mana_multiplier');
  const unitManaInc = Math.round(Math.min(Math.max(unitManaMult * damage, 5), 15)); // Move 5 and 15 to pokemon.js
  const manaCost = board.get(unitPos).get('manaCost');
  const newMana = Math.min(+unitMana + +unitManaInc, manaCost);
  manaChanges = manaChanges.set(unitPos, newMana);
  if (!f.isUndefined(enemyPos)) {
    const enemyMana = board.get(enemyPos).get('mana');
    const enemyManaMult = board.get(enemyPos).get('mana_multiplier');
    const enemyManaInc = Math.round(Math.min(enemyManaMult * damage, 15));
    const enemyManaCost = board.get(enemyPos).get('manaCost');
    const enemyNewMana = Math.min(+enemyMana + +enemyManaInc, enemyManaCost);
    return manaChanges.set(enemyPos, enemyNewMana);
  }
  return manaChanges;
}

async function manaChangeBoard(boardParam, manaChanges) {
  let board = boardParam;
  const iter = manaChanges.keys();
  let temp = iter.next();
  while (!temp.done) {
    const pid = temp.value;
    board = board.setIn([pid, 'mana'], manaChanges.get(pid));
    temp = iter.next();
  }
  return board;
}

/**
 * Calculate amount of damage to be dealt to defender
 * Take defense of defender into account
 * Take type differences into account
 * Calculate factor against both defending types (if super effective against both, 4x damage)
 * Attack should use one type, main one preferrbly
 * Temp: Assumed typesAttacker is first listed type for normal attacks, set in ability for abilities
 * Power might be wanted
 */
async function calcDamage(actionType, power, unit, target, typeFactor, useSpecial = false) { // attack, defense, typesAttacker, typesDefender
  // console.log('@calcDamage', unit, target)
  const damageRatio = (useSpecial ? unit.get('specialAttack') / target.get('specialDefense') : unit.get('attack') / target.get('defense'));
  const factor = gameConstantsJS.getDamageFactorType(actionType) * power * damageRatio;
  f.p('@calcDamage returning: ', typeFactor, '*', Math.round(factor), '+ 1 =', Math.round(factor * typeFactor + 1));
  return Math.round(factor * typeFactor + 1);
}

/**
 * Heals unit at unitPos by heal amount, not over max hp
 */
async function healUnit(board, unitPos, heal) {
  const maxHp = (await pawns.getStats(board.get(unitPos).get('name'))).get('hp');
  const newHp = (board.getIn([unitPos, 'hp']) + heal >= maxHp ? maxHp : board.getIn([unitPos, 'hp']) + heal);
  const hpHealed = newHp - board.getIn([unitPos, 'hp']);
  return Map({ board: board.setIn([unitPos, 'hp'], newHp), hpHealed });
}

/**
 * Use ability
 * Remove mana for spell
 * noTarget functionality
 * Damage unit if have power
 * Temp: Move noTarget out of here
 * Doesn't support aoe currently
 * TODO: Mark the specific information in move
 *    Attempt fix by effectMap
 * currently: returns board
 * new: {board, effect} where effect = abilityTriggers contain heals or dot
 */
async function useAbility(board, ability, damageParam, unitPos, target) {
  let damage = damageParam;
  const manaCost = ability.get('mana') || abilitiesJS.getAbilityDefault('mana');
  const newMana = board.getIn([unitPos, 'mana']) - manaCost;
  const manaChanges = Map({ unitPos: newMana });
  let newBoard = board.setIn([unitPos, 'mana'], newMana);
  let effectMap = Map({});
  if (!f.isUndefined(ability.get('effect'))) {
    const effect = ability.get('effect');
    const mode = (f.isUndefined(effect.size) ? effect : effect.get(0));
    const args = (f.isUndefined(effect.size) ? undefined : effect.shift(0));
    console.log('@useAbility mode', mode, ', args', args);
    switch (mode) {
      case 'buff': {
        if (!f.isUndefined(args)) { // Args: Use buff on self on board [buffType, amount]
          const buffValue = newBoard.getIn([unitPos, args.get(0)]) + args.get(1);
          console.log('@useAbility - buff', buffValue);
          newBoard = newBoard.setIn([unitPos, args.get(0)], buffValue);
          effectMap = effectMap.setIn([unitPos, `buff${args.get(0)}`], buffValue);
        }
      }
      case 'teleport':
        console.log('@teleport');
      case 'transform':
      case 'noTarget': {
        console.log('@useAbility - noTarget return for mode =', mode);
        if (damage !== 0) {
          console.log('@NoTarget HMMM', damage);
          damage = 0;
        }
        // return Map({ board: Map({ board: newBoard }) });
        break;
      }
      case 'lifesteal': {
        const lsFactor = (!f.isUndefined(args) ? args.get(0) : abilitiesJS.getAbilityDefault('lifestealValue'));
        const healObj = await healUnit(newBoard, unitPos, Math.round(lsFactor * damage));
        newBoard = healObj.get('board');
        effectMap = effectMap.setIn([unitPos, 'heal'], healObj.get('hpHealed'));
        break;
      }
      case 'dot': {
        const accuracy = (!f.isUndefined(args) ? args.get(0) : abilitiesJS.getAbilityDefault('dotAccuracy'));
        const dmg = (!f.isUndefined(args) ? args.get(1) : abilitiesJS.getAbilityDefault('dotDamage'));
        if (dmg > (newBoard.getIn([target, 'dot']) || 0)) {
          if (Math.random() < accuracy) { // Successfully puts poison
            console.log(' --- Poison hit on ', target);
            newBoard = await newBoard.setIn([target, 'dot'], dmg);
            effectMap = effectMap.setIn([target, 'dot'], dmg);
          }
        }
        break;
      }
      case 'aoe':
        // TODO - Can it even be checked here first? Probably before this stage
        break;
      case 'multiStrike': {
        const percentages = abilitiesJS.getAbilityDefault('multiStrikePercentage');
        const r = Math.random();
        let sum = 0;
        for (let i = 0; i < 4; i++) {
          sum += percentages.get(i);
          if (r <= sum) { // 2-5 hits
            damage *= (2 + i);
            effectMap = effectMap.setIn([unitPos, 'multiStrike'], (2 + i));
            break;
          }
        }
        break;
      }
      default:
        console.log('@useAbility - default, mode =', mode);
    }
  }
  return Map({ removeHpBoard: (await removeHpBattle(newBoard, target, damage)), effect: effectMap, manaChanges });
}

/**
 * Is battle over?
 */
async function isBattleOver(board, team) {
  // console.log('@isBattleOver Check me', board, team)
  const keysIter = board.keys();
  let tempUnit = keysIter.next();
  while (!tempUnit.done) {
    // console.log('in battleover: ', board.get(tempUnit.value).get('team'))
    if (board.get(tempUnit.value).get('team') === 1 - team) {
      return false;
    }
    tempUnit = keysIter.next();
  }
  return true;
}

/**
 * Convert damage in percentage to value
 */
async function dmgPercToHp(board, unitPos, percentDmg) {
  const maxHp = (await pawns.getStats(board.get(unitPos).get('name'))).get('hp');
  return Math.round(maxHp * percentDmg);
}

/**
 * Gives new board after dot damage is handled for unit
 * Returns Map({board, damage, unitDied})
 */
async function handleDotDamage(board, unitPos) { // , team
  const dot = board.getIn([unitPos, 'dot']);
  if (!f.isUndefined(dot)) {
    const dmgHp = await dmgPercToHp(board, unitPos, dot);
    const removedHPBoard = await removeHpBattle(board, unitPos, dmgHp); // {board, unitDied}
    const newBoard = removedHPBoard.get('board');
    return Map({ board: newBoard, damage: dmgHp, unitDied: removedHPBoard.get('unitDied') });
  }
  return Map({ board });
}

/**
 * Deletes all entries for a unit so allowed same move cant be used to attack those units
 * If a unit dies, the people that previously attacked that unit have to select new target
 */
async function deleteNextMoveResultEntries(unitMoveMapParam, targetToRemove) {
  // console.log('@deleteNextMoveResultEntries', targetToRemove)
  let unitMoveMap = unitMoveMapParam;
  const keysIter = unitMoveMap.keys();
  let tempUnit = keysIter.next();
  // console.log('@deleteNextMoveResultEntries', unitMoveMap, targetToRemove);
  while (!tempUnit.done) {
    const tempPrevMove = unitMoveMap.get(tempUnit.value);
    const target = tempPrevMove.get('nextMove').get('target');
    const invalidPrevTarget = targetToRemove;
    if (f.x(target) === f.x(invalidPrevTarget) && f.y(target) === f.y(invalidPrevTarget)) {
      unitMoveMap = await unitMoveMap.delete(tempUnit.value);
      // console.log('Deleting prevMove for: ', tempUnit.value, nextMoveResult.get('nextMove').get('target'))
    }
    tempUnit = keysIter.next();
  }
  return unitMoveMap.delete(targetToRemove);
}

/**
 * Next move calculator
 * If mana is full use spell
 * Unit checks if it can attack an enemy, is within unit.range
 * If it can, attack on closests target position
 *  If enemy unit dies, check battle over
 *  if attack is made, increase mana for both units
 * If not, make a move to closest enemy unit
 *
 * Map({nextMove: Map({action: action, value: value, target: target}),
 * newBoard: newBoard, battleOver: true, allowSameMove: true})
 */
async function nextMove(board, unitPos, optPreviousTarget) {
  const unit = board.get(unitPos);
  if (unit.get('mana') >= unit.get('manaCost')) { // Use spell, && withinRange for spell
    // TODO AOE spell logic
    // Idea: Around every adjacent enemy in range of 1 from closest enemy
    const team = unit.get('team');
    const ability = await abilitiesJS.getAbility(unit.get('name'));
    // TODO Check aoe / notarget here instead
    // console.log('@spell ability', ability)
    if (f.isUndefined(ability)) {
      console.log(`${unit.get('name')} buggy ability`);
    }
    const range = (!f.isUndefined(ability.get('acc_range')) && !f.isUndefined(ability.get('acc_range').size)
      ? ability.get('acc_range').get(1) : abilitiesJS.getAbilityDefault('range'));
    const enemyPos = await getClosestEnemy(board, unitPos, range, team);
    const action = 'spell';
    const target = await enemyPos.get('closestEnemy');
    // console.log('@nextmove - ability target: ', target, enemyPos)
    const typeFactor = await typesJS.getTypeFactor(ability.get('type'), board.get(target).get('type'));
    const abilityDamage = (ability.get('power') ? await calcDamage(action, ability.get('power'), unit, board.get(target), typeFactor, true) : 0);
    const abilityName = ability.get('displayName');
    const abilityResult = await useAbility(board, ability, abilityDamage, unitPos, target);
    // console.log('@abilityResult', abilityResult)
    const removedHPBoard = abilityResult.get('removeHpBoard');
    const effect = abilityResult.get('effect');
    const manaChanges = abilityResult.get('manaChanges');
    // Do game over check
    const newBoard = removedHPBoard.get('board');
    // console.log('@spell', newBoard)
    let battleOver = false;
    let damageDealt = abilityDamage;
    if (removedHPBoard.get('unitDied')) {
      battleOver = await isBattleOver(newBoard, team);
      damageDealt = removedHPBoard.get('unitDied');
    }
    const move = Map({
      unitPos,
      action,
      value: damageDealt,
      abilityName,
      target,
      effect,
      manaChanges,
      typeEffective: gameConstantsJS.getTypeEffectString(typeFactor),
      direction: enemyPos.get('direction'),
    });
    return Map({
      nextMove: move,
      newBoard,
      battleOver,
    });
  }
  // Attack
  const range = unit.get('range');
  const team = unit.get('team');
  let tarpos;
  if (!f.isUndefined(optPreviousTarget)) {
    tarpos = Map({ closestEnemy: optPreviousTarget.get('target'), withinRange: true, direction: optPreviousTarget.get('direction') });
  } else {
    tarpos = getClosestEnemy(board, unitPos, range, team);
  }
  const enemyPos = tarpos; // await
  if (enemyPos.get('withinRange')) { // Attack action
    const action = 'attack';
    const target = enemyPos.get('closestEnemy');
    f.p('Closest Enemy: ', unitPos, team, target);
    const attackerType = (!f.isUndefined(unit.get('type').size) ? unit.get('type').get(0) : unit.get('type'));
    // console.log('@nextmove - normal attack target: ', target, enemyPos)
    const typeFactor = await typesJS.getTypeFactor(attackerType, board.get(target).get('type'));
    const value = await calcDamage(action, unit.get('attack'), unit, board.get(target), typeFactor);
    // Calculate newBoard from action
    const removedHPBoard = await removeHpBattle(board, target, value); // {board, unitDied}
    const newBoard = removedHPBoard.get('board');
    let battleOver = false;
    let allowSameMove = false;
    let newBoardMana;
    let manaChanges;
    let damageDealt = value;
    if (removedHPBoard.get('unitDied')) { // Check if battle ends
      battleOver = await isBattleOver(newBoard, team);
      manaChanges = await manaIncrease(newBoard, value, unitPos); // target = dead
      newBoardMana = await manaChangeBoard(newBoard, manaChanges);
      damageDealt = removedHPBoard.get('unitDied');
    } else { // Mana increase, return newBoard
      allowSameMove = true;
      manaChanges = await manaIncrease(newBoard, value, unitPos, target);
      newBoardMana = await manaChangeBoard(newBoard, manaChanges);
    }
    const move = Map({
      unitPos,
      action,
      value: damageDealt,
      target,
      manaChanges,
      typeEffective: gameConstantsJS.getTypeEffectString(typeFactor),
      direction: enemyPos.get('direction'),
    });
    return Map({
      nextMove: move,
      newBoard: newBoardMana,
      allowSameMove,
      battleOver,
    });
  } // Move action
  const closestEnemyPos = enemyPos.get('closestEnemy');
  // console.log('Moving ...', unitPos, 'to', closestEnemyPos, range)
  const movePosObj = await getStepMovePos(board, unitPos, closestEnemyPos, range, team);
  const movePos = movePosObj.get('movePos');
  const direction = movePosObj.get('direction');
  f.p('Move: ', unitPos, 'to', movePos);
  let newBoard;
  let action;
  if (unitPos === movePos) {
    action = 'noAction';
    newBoard = board;
  } else {
    newBoard = board.set(movePos, unit.set('position', movePos)).delete(unitPos);
    action = 'move';
  }
  const move = Map({
    unitPos, action, target: movePos, direction,
  });
  return Map({ nextMove: move, newBoard });
}

/**
 * Returns position of unit with the next move
 */
async function getUnitWithNextMove(board) {
  // console.log('@getUnitWithNextMove',board)
  const boardKeysIter = board.keys();
  let tempUnit = boardKeysIter.next();
  let lowestNextMove = List([tempUnit.value]);
  let lowestNextMoveValue = board.get(tempUnit.value).get('next_move');
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const unitNextMove = board.get(unitPos).get('next_move');
    if (unitNextMove < lowestNextMoveValue) { // New lowest move
      lowestNextMove = List([unitPos]);
      lowestNextMoveValue = unitNextMove;
    } else if (unitNextMove === lowestNextMoveValue) {
      lowestNextMove = lowestNextMove.push(unitPos);
    }
    tempUnit = boardKeysIter.next();
  }
  // Find nextMove unit
  if (lowestNextMove.size === 1) {
    if (f.isUndefined(lowestNextMove.get(0))) {
      console.log('@getUnitWithNextMove Undefined', board);
    }
    return lowestNextMove.get(0);
  }
  // Decide order of equal next move units
  // Approved Temp: Random order
  return lowestNextMove.get(Math.floor(Math.random() * lowestNextMove.size));
}




/**
 * Board with first_move: pos set for all units
 */
async function setRandomFirstMove(board) {
  const boardKeysIter = board.keys();
  let tempUnit = boardKeysIter.next();
  let newBoard = board;
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const newPos = unitPos;
    // TODO: Factor for movement from pokemon
    // Temp: 0.5
    const isMoving = Math.random() > 0.5;
    if (isMoving) {
      // TODO Make logical movement calculation,
      // Approved Temp: currently starts default spot, makes no firstmove
    }
    // console.log('\n@setRandomFirstMove', board)
    newBoard = newBoard.setIn([unitPos, 'first_move'], newPos);
    tempUnit = boardKeysIter.next();
  }
  return newBoard;
}
/*
  // While temp
  const iter = map.keys();
  let temp = iter.next();
  while (!temp.done) {

    temp = iter.next();
  }
*/



/**
 * *This is not a player made action, time based event for all players
 * *When last battle is over this method shall be called
 * Increase players exp by 1
 * Refresh shop as long as player is not locked
 * Gold:
 *  Interest for 10 gold
 *  Increasing throughout the game basic income
 *  Win streak / lose streak
 */
async function endTurn(stateParam) {
  let state = stateParam;
  const income_basic = state.get('income_basic') + 1;
  const round = state.get('round');
  const roundType = gameConstantsJS.getRoundType(round);
  state = state.set('round', round + 1);
  if (round <= 5) {
    state = state.set('income_basic', income_basic);
  }

  // While temp
  const iter = state.get('players').keys();
  let temp = iter.next();
  while (!temp.done) {
    const index = temp.value;
    const locked = state.getIn(['players', index, 'locked']);
    if (!locked) {
      state = await shopJS.refreshShop(state, index);
      // console.log('Not locked for player[' + i + '] \n', state.get('pieces').get(0));
    }
    state = await increaseExp(state, index, 1);
    const gold = state.getIn(['players', index, 'gold']);
    // Min 0 gold interest -> max 5
    const bonusGold = Math.min(Math.floor(gold / 10), 5);
    const streak = state.getIn(['players', index, 'streak']) || 0;
    const streakGold = (roundType === 'pvp' ? Math.min(Math.floor(
      (streak === 0 || Math.abs(streak) === 1 ? 0 : (Math.abs(streak) / 5) + 1),
    ), 3) : 0);
    const newGold = gold + income_basic + bonusGold + streakGold;
    /*
    console.log(`@playerEndTurn Gold: p[${index + 1}]: `,
      `${gold}, ${income_basic}, ${bonusGold}, ${streakGold} (${streak}) = ${newGold}`);
    */
    state = state.setIn(['players', index, 'gold'], newGold);
    temp = iter.next();
  }
  const newState = await state;
  return newState;
}

let synchronizedPlayers = Map({});

/**
 * Builds new state after battles
 */
async function prepEndTurn(state, playerIndex) {
  synchronizedPlayers = synchronizedPlayers.set(playerIndex, state.getIn(['players', playerIndex]));
  if (synchronizedPlayers.size === state.get('amountOfPlayers')) {
    console.log('@prepEndTurn CHECK: Ending Turn', state.get('amountOfPlayers'));
    const newState = state.set('players', synchronizedPlayers); // Set
    synchronizedPlayers = Map({});
    const newRoundState = await endTurn(newState);
    return Map({state: newRoundState, last: true});
  }
  return Map({state, last: false});
}

/**
 * Given a list of units, calculate damage to be removed from player
 * 1 point per level of unit
 * Units level is currently their cost
 * TODO: Balanced way of removing hp (level is exponentially bad for many units)
 */
async function calcDamageTaken(boardUnits) {
  if (f.isUndefined(boardUnits) || boardUnits.size === 0) {
    f.p('@calcDamageTaken Returning 0 ', boardUnits);
    return 0; // When there are no units left for the enemy, don't lose hp (A tie)
  }
  let sum = 0;
  // console.log('@calcDamageTaken', boardUnits.size, boardUnits)
  const keysIter = boardUnits.keys();
  let tempUnit = keysIter.next();
  // Each surviving piece does damage based on its level: 1+floor(level/3)
  // Level 1-2 units do 1 damage, 3-5 do 2 damage, 6-8 do 3 damage, level 9 do 4 damage
  while (!tempUnit.done) {
    const stats = await pawns.getStats(boardUnits.get(tempUnit.value).get('name'));
    const level = +stats.get('cost');
    sum += 1 + Math.floor(level / 3);
    tempUnit = keysIter.next();
  }
  return sum;
}

/**
 * Remove hp from player
 * Mark player as defeated if hp <= 0, by removal of player from players
 * Also decrease amountOfPlayers
 */
async function removeHp(state, playerIndex, hpToRemove) {
  const currentHp = state.getIn(['players', playerIndex, 'hp']);
  if (currentHp - hpToRemove <= 0) {
    return state.setIn(['players', playerIndex, 'dead'], true);
  }
  return state.setIn(['players', playerIndex, 'hp'], currentHp - hpToRemove);
}

/**
 * winner: Gain 1 gold
 * loser: Lose hp
 *      Calculate amount of hp to lose
 * Parameters: Enemy player index, winningAmount = damage? (units or damage)
 */
const endBattle = async (stateParam, playerIndex, winner, finishedBoard, roundType, enemyPlayerIndex) => {
  let state = stateParam;
  // console.log('@Endbattle :', playerIndex, winner);
  if (f.isUndefined(finishedBoard)) console.log(finishedBoard);
  // console.log('@endBattle', state, playerIndex, winner, enemyPlayerIndex);
  const streak = state.getIn(['players', playerIndex, 'streak']) || 0;
  if (winner) { // Winner
    // TODO: Npc rewards and gym rewards
    switch (roundType) {
      case 'pvp': {
        const prevGold = state.getIn(['players', playerIndex, 'gold']);
        state = state.setIn(['players', playerIndex, 'gold'], prevGold + 1);
        const newStreak = (streak < 0 ? 0 : +streak + 1);
        state = state.setIn(['players', playerIndex, 'streak'], newStreak);
        f.p('@endBattle Won Player', playerIndex, prevGold, state.getIn(['players', playerIndex, 'gold']), newStreak);
        break;
      }
      case 'npc':
      case 'gym':
        /* TODO: Add item drops / special money drop */
      case 'shop':
      default:
    }
  } else { // Loser
    switch (roundType) {
      case 'pvp': {
        const newStreak = (streak > 0 ? 0 : +streak - 1);
        state = state.setIn(['players', playerIndex, 'streak'], newStreak);
        f.p('@Endbattle pvp', newStreak);
      }
      case 'npc': {
        const hpToRemove = await calcDamageTaken(finishedBoard);
        state = await removeHp(state, playerIndex, hpToRemove);
        f.p('@endBattle Lost Player', playerIndex, hpToRemove);
        break;
      }
      case 'gym': {
        const hpToRemove = await calcDamageTaken(finishedBoard);
        const gymDamage = Math.min(hpToRemove, 3);
        state = await removeHp(state, playerIndex, gymDamage);
        f.p('@endBattle Gymbattle');
      }
      case 'shop':
      default:
    }
  }
  // console.log('@endBattle prep', stateParam.get('players'));
  const potentialEndTurnObj = await prepEndTurn(state, playerIndex);
  return potentialEndTurnObj;
};

exports.endBattleForAll = async (stateParam, winners, finalBoards, matchups, roundType) => {
  let tempState = stateParam;
  const iter = stateParam.get('players').keys();
  let temp = iter.next();
  while (!temp.done) {
    const tempIndex = temp.value;
    const winner = winners.get(tempIndex);
    const finalBoard = finalBoards.get(tempIndex);
    const enemy = (matchups ? matchups.get(tempIndex) : undefined);
    // winner & newBoard & isPvpRound & enemy index required
    const round = tempState.get('round');
    const newStateAfterBattleObj = await endBattle(tempState, tempIndex, winner, finalBoard, roundType, enemy);
    const newStateAfterBattle = newStateAfterBattleObj.get('state');
    const isLast = newStateAfterBattleObj.get('last');
    if (isLast && newStateAfterBattle.get('round') === round + 1) {
      tempState = await newStateAfterBattle;
    } else {
      tempState = tempState.setIn(['players', tempIndex], newStateAfterBattle.getIn(['players', tempIndex]));
    }
    temp = iter.next();
  }
  const newState = await tempState;
  return newState;
};

exports.removeDeadPlayer = async (stateParam, playerIndex) => {
  // console.log('@removeDeadPlayer')
  let state = stateParam;
  const filteredShop = state.getIn(['players', playerIndex, 'shop']).filter(piece => !f.isUndefined(piece));
  const shopUnits = fromJS(Array.from(filteredShop.map((value, key) => value.get('name')).values()));
  const board = state.getIn(['players', playerIndex, 'board']);
  let boardList = List([]);
  const iter = board.keys();
  let temp = iter.next();
  while (!temp.done) {
    const uid = temp.value;
    const unit = board.get(uid);
    boardList = boardList.push(unit.get('name'));
    temp = iter.next();
  }
  // console.log('BoardList', boardList);
  const hand = state.getIn(['players', playerIndex, 'hand']);
  let handList = List([]);
  const iter2 = hand.keys();
  let temp2 = iter2.next();
  while (!temp2.done) {
    const uid = temp2.value;
    const unit = hand.get(uid);
    handList = handList.push(unit.get('name'));
    temp2 = iter2.next();
  }
  // console.log('HandList', handList);
  const playerUnits = shopUnits.concat(boardList).concat(handList);
  console.log('@removeDeadPlayer', shopUnits, boardList, handList, '=', playerUnits);
  for (let i = 0; i < playerUnits.size; i++) {
    state = await discardBaseUnits(state, playerIndex, playerUnits.get(i));
  }
  // state = state.set('discardedPieces', state.get('discardedPieces').concat(playerUnits));
  const newState = state.set('players', state.get('players').delete(playerIndex));
  // console.log('@removeDeadPlayer', newState.get('players'));
  const amountOfPlayers = newState.get('amountOfPlayers') - 1;
  return newState.set('amountOfPlayers', amountOfPlayers);
};


/**
 * Initialize all shops for all players
 * Round already set to 1
 */
async function startGame(stateParam) {
  let state = stateParam;
  const iter = state.get('players').keys();
  let temp = iter.next();
  while (!temp.done) {
    state = await shopJS.refreshShop(state, temp.value);
    temp = iter.next();
  }
  return state;
}


exports.startGameGlobal = async (amountPlaying) => {
  const state = await StateJS.initEmpty(amountPlaying);
  return startGame(state);
};
