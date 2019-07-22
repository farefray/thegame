const {
  Map,
  List,
  Set,
} = require('immutable');
const f = require('../f');
const gameConstantsJS = require('../game_constants');
const typesJS = require('../types');

const pawns = require('../pawns');
const abilitiesJS = require('../abilities');
const BattleJS = require('./battle');

const UnitJS = {};

/** Private methods */

/**
 * Heals unit at unitPos by heal amount, not over max hp
 */
async function _healUnit(board, unitPos, heal) {
  const maxHp = (await pawns.getStats(board.get(unitPos).get('name'))).get('hp');
  const newHp = (board.getIn([unitPos, 'hp']) + heal >= maxHp ? maxHp : board.getIn([unitPos, 'hp']) + heal);
  const hpHealed = newHp - board.getIn([unitPos, 'hp']);
  return Map({ board: board.setIn([unitPos, 'hp'], newHp), hpHealed });
}

async function _manaChangeBoard(boardParam, manaChanges) {
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
 * Increases mana for both units on board
 * Returns updated board
 * Supports enemy being dead
 * TODO: Maybe, Load from defaults here, so mana stats don't have to be stored in vain
 */
async function _manaIncrease(board, damage, unitPos, enemyPos) {
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

/**
 * Calculate amount of damage to be dealt to defender
 * Take defense of defender into account
 * Take type differences into account
 * Calculate factor against both defending types (if super effective against both, 4x damage)
 * Attack should use one type, main one preferrbly
 * Temp: Assumed typesAttacker is first listed type for normal attacks, set in ability for abilities
 * Power might be wanted
 */
async function _calcDamage(actionType, power, unit, target, typeFactor, useSpecial = false) { // attack, defense, typesAttacker, typesDefender
  // console.log('@calcDamage', unit, target)
  const damageRatio = (useSpecial ? unit.get('specialAttack') / target.get('specialDefense') : unit.get('attack') / target.get('defense'));
  const factor = gameConstantsJS.getDamageFactorType(actionType) * power * damageRatio;
  f.p('@calcDamage returning: ', typeFactor, '*', Math.round(factor), '+ 1 =', Math.round(factor * typeFactor + 1));
  return Math.round(factor * typeFactor + 1);
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
async function _useAbility(board, ability, damageParam, unitPos, target) {
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
        const healObj = await _healUnit(newBoard, unitPos, Math.round(lsFactor * damage));
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
  return Map({ removeHpBoard: (await BattleJS.removeHpBattle(newBoard, target, damage)), effect: effectMap, manaChanges });
}

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
  return f.isUndefined(board.get(pos)) && x >= 0 && x < 8 && y >= 0 && y < 8;
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
  const heuristicScore = distanceTraveled + _getHeuristicScore(pos, enemyPos);
  return pathFind.setIn(['cameFrom', pos], current).setIn(['fromStartScore', pos], distanceTraveled).setIn(['heuristicScore', pos], heuristicScore);
}

/** Public methods */

/**
 * Create unit for board battle from createBoardUnit unit given newpos/pos and team
 */
UnitJS.createBattleUnit = async (unit, unitPos, team) => {
  const unitStats = await pawns.getStats(unit.get('name'));
  const ability = await abilitiesJS.getAbility(unit.get('name'));
  // if(ability.get('mana')) console.log('@createBattleUnit', unit.get('name'), unitStats.get('ability'), ability.get('mana'));
  return unit.set('team', team).set('attack', unitStats.get('attack'))
    .set('hp', unitStats.get('hp'))
    .set('maxHp', unitStats.get('hp'))
    .set('startHp', unitStats.get('hp'))
    .set('type', unitStats.get('type'))
    .set('next_move', unitStats.get('next_move') || pawns.getStatsDefault('next_move'))
    .set('mana', unitStats.get('mana') || pawns.getStatsDefault('mana'))
    .set('ability', unitStats.get('ability'))
    .set('defense', unitStats.get('defense') || pawns.getStatsDefault('defense'))
    .set('speed', pawns.getStatsDefault('upperLimitSpeed') - (unitStats.get('speed') || pawns.getStatsDefault('speed')))
    /* .set('mana_hit_given', unitStats.get('mana_hit_given') || pawns.getStatsDefault('mana_hit_given'))
    .set('mana_hit_taken', unitStats.get('mana_hit_taken') || pawns.getStatsDefault('mana_hit_taken')) */
    .set('mana_multiplier', unitStats.get('mana_multiplier') || pawns.getStatsDefault('mana_multiplier'))
    .set('specialAttack', unitStats.get('specialAttack'))
    .set('specialDefense', unitStats.get('specialDefense'))
    .set('position', unitPos)
    .set('range', unitStats.get('range') || pawns.getStatsDefault('range'))
    .set('manaCost', ability.get('mana') || abilitiesJS.getDefault('mana'));
};

/**
 * Create unit for board/hand placement from name and spawn position
 */
UnitJS.getBoardUnit = async (name, x, y) => {
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
};

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
UnitJS.getClosestEnemy = async (board, unitPos, range, team, exceptionsList = List([])) => {
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
        const direction = _getDirection(unitPos, pos);
        return Map({ closestEnemy: pos, withinRange, direction });
      }
      pos = f.pos(j, y + i);
      if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
        const direction = _getDirection(unitPos, pos);
        return Map({ closestEnemy: pos, withinRange, direction });
      }
    }
    for (let j = y - i + 1; j < y + i; j++) {
      pos = f.pos(x - i, j);
      if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
        const direction = _getDirection(unitPos, pos);
        return Map({ closestEnemy: pos, withinRange, direction });
      }
      pos = f.pos(x + i, j);
      if (!f.isUndefined(board.get(pos)) && board.get(pos).get('team') === enemyTeam && !exceptionsList.contains(pos)) {
        const direction = _getDirection(unitPos, pos);
        return Map({ closestEnemy: pos, withinRange, direction });
      }
    }
  }
  // f.print(board, '@getClosestEnemy Returning undefined: Board\n');
  console.log('@getClosestEnemy Returning undefined: ', x, y, range, team);
  return Map({ closestEnemy: undefined, withinRange: false, direction: '' });
};

UnitJS.getStepMovePos = async (board, unitPos, closestEnemyPos, range, team, exceptionsList = List([])) => {
  const stepsToTake = Math.floor(Math.random() * 2 + 1); // 1 currently //  1 - 2, * 2
  const rangeToTarget = _getHeuristicScore(unitPos, closestEnemyPos);
  if (stepsToTake > rangeToTarget) { // Within range, move to closest available space // && rangeToTarget === 1
    const goal = _getMovePos(board, closestEnemyPos, 1, team);
    const direction = _getDirection(unitPos, goal);
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
    const current = _getLowestKey(pathFind.get('toVisit'), pathFind.get('heuristicScore'));
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
        const direction = _getDirection(unitPos, path.get(index));
        // console.log('Move direction: ', direction);
        return Map({ movePos: path.get(index), direction });
      }
    }
    // console.log('@Path Current', current);
    pathFind = pathFind.set('toVisit', pathFind.get('toVisit').delete(current)).set('visited', pathFind.get('visited').add(current));
    // console.log('@Path Visited', pathFind.get('visited'));

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
    return Map({ movePos: unitPos, direction: '' });
  }
  // TODO: Check so not blocked in
  console.log(`No path available to piece, ${closestEnemyPos} from ${unitPos} (Range: ${range}). Going deeper`);
  return UnitJS.getStepMovePos(board, unitPos, newClosestEnemyObj.get('closestEnemy'), range, team, exceptionsList.push(closestEnemyPos));
};

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
UnitJS.generateNextMove = async (board, unitPos, optPreviousTarget) => {
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
    const enemyPos = await UnitJS.getClosestEnemy(board, unitPos, range, team);
    const action = 'spell';
    const target = await enemyPos.get('closestEnemy');
    // console.log('@nextmove - ability target: ', target, enemyPos)
    const typeFactor = await typesJS.getTypeFactor(ability.get('type'), board.get(target).get('type'));
    const abilityDamage = (ability.get('power') ? await _calcDamage(action, ability.get('power'), unit, board.get(target), typeFactor, true) : 0);
    const abilityName = ability.get('displayName');
    const abilityResult = await _useAbility(board, ability, abilityDamage, unitPos, target);
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
      battleOver = await BattleJS.isBattleOver(newBoard, team);
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
    tarpos = UnitJS.getClosestEnemy(board, unitPos, range, team);
  }
  const enemyPos = tarpos; // await
  if (enemyPos.get('withinRange')) { // Attack action
    const action = 'attack';
    const target = enemyPos.get('closestEnemy');
    f.p('Closest Enemy: ', unitPos, team, target);
    const attackerType = (!f.isUndefined(unit.get('type').size) ? unit.get('type').get(0) : unit.get('type'));
    // console.log('@nextmove - normal attack target: ', target, enemyPos)
    const typeFactor = await typesJS.getTypeFactor(attackerType, board.get(target).get('type'));
    const value = await _calcDamage(action, unit.get('attack'), unit, board.get(target), typeFactor);
    // Calculate newBoard from action
    const removedHPBoard = await BattleJS.removeHpBattle(board, target, value); // {board, unitDied}
    const newBoard = removedHPBoard.get('board');
    let battleOver = false;
    let allowSameMove = false;
    let newBoardMana;
    let manaChanges;
    let damageDealt = value;
    if (removedHPBoard.get('unitDied')) { // Check if battle ends
      battleOver = await BattleJS.isBattleOver(newBoard, team);
      manaChanges = await _manaIncrease(newBoard, value, unitPos); // target = dead
      newBoardMana = await _manaChangeBoard(newBoard, manaChanges);
      damageDealt = removedHPBoard.get('unitDied');
    } else { // Mana increase, return newBoard
      allowSameMove = true;
      manaChanges = await _manaIncrease(newBoard, value, unitPos, target);
      newBoardMana = await _manaChangeBoard(newBoard, manaChanges);
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
  const movePosObj = await UnitJS.getStepMovePos(board, unitPos, closestEnemyPos, range, team);
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
};

/**
 * Deletes all entries for a unit so allowed same move cant be used to attack those units
 * If a unit dies, the people that previously attacked that unit have to select new target
 */
UnitJS.deleteNextMoveResultEntries = async (unitMoveMapParam, targetToRemove) => {
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
};

module.exports = UnitJS;
