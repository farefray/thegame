const {
  Map,
  List,
  fromJS,
} = require('immutable');
const pawns = require('../pawns');
const f = require('../f');
const gameConstantsJS = require('../game_constants');
const typesJS = require('../types');
const abilitiesJS = require('../abilities');

const BoardJS = require('./board');
const UnitJS = require('./unit');

const BattleJS = {};

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

/**
 * Convert damage in percentage to value
 */
async function _dmgPercToHp(board, unitPos, percentDmg) {
  const maxHp = (await pawns.getStats(board.get(unitPos).get('name'))).get('hp');
  return Math.round(maxHp * percentDmg);
}

/**
 * Gives new board after dot damage is handled for unit
 * Returns Map({board, damage, unitDied})
 */
async function _handleDotDamage(board, unitPos) {
  const dot = board.getIn([unitPos, 'dot']);
  if (!f.isUndefined(dot)) {
    const dmgHp = await _dmgPercToHp(board, unitPos, dot);
    const removedHPBoard = await BattleJS.removeHpBattle(board, unitPos, dmgHp); // {board, unitDied}
    const newBoard = removedHPBoard.get('board');
    return Map({ board: newBoard, damage: dmgHp, unitDied: removedHPBoard.get('unitDied') });
  }
  return Map({ board });
}

/**
 * Board with first_move: pos set for all units
 */
async function _setRandomFirstMove(board) {
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

/**
 * Battle:
 * Grab next unit to move
 * simulate next move for that unit and calculate new board
 * add that move to actionStack
 * Continue until battle over
 */
async function _startBattle(boardParam) {
  let actionStack = List([]);
  let unitMoveMap = Map({});
  let dmgBoard = Map({});
  let board = boardParam;
  // f.print(board, '@startBattle')
  let battleOver = false;

  // First move for all units first
  // Remove first_move from all units when doing first movement
  // First move used for all units (order doesn't matter) and set next_move to + speed accordingly
  // Update actionStack and board accordingly
  const iter = board.keys();
  let temp = iter.next();
  while (!temp.done) {
    const unitPos = temp.value;
    const action = 'move';
    const unit = board.get(unitPos);
    if (unit.get('hp') <= 0) {
      board = board.delete(unitPos);
      battleOver = battleOver || await BattleJS.isBattleOver(board, 1 - unit.get('team'));
      console.log('Removing unit with hp < 0 before battle start', unit.get('name'), unit.get('hp'), 'battleOver', battleOver);
    } else {
      const target = unit.get('first_move');
      const time = 0;
      const move = Map({
        unitPos, action, target, time,
      });
      actionStack = actionStack.push(move);
      const newUnit = unit.set('next_move', +unit.get('next_move') + +unit.get('speed'))
        .delete('first_move');
      board = board.set(unitPos, newUnit);
    }
    temp = iter.next();
  }
  // Start battle
  while (!battleOver) {
    board = await board;
    // console.log('board @startBattle', board)
    if (f.isUndefined(board)) {
      console.log('board undefined in startBattle');
    }
    const nextUnitToMove = await BoardJS.getUnitWithNextMove(board);
    const unit = board.get(nextUnitToMove);
    // console.log('\n@startbattle Next unit to do action: ', nextUnitToMove);
    const previousMove = unitMoveMap.get(nextUnitToMove);
    // console.log(' --- ', (f.isUndefined(previousMove) ? '' : previousMove.get('nextMove').get('target')), nextUnitToMove)
    let nextMoveResult;
    if (!f.isUndefined(previousMove)) { // Use same target as last round
      // console.log('previousMove in @startBattle', previousMove.get('nextMove').get('target'));
      const previousTarget = previousMove.get('nextMove').get('target');
      const previousDirection = previousMove.get('nextMove').get('direction');
      nextMoveResult = await BattleJS.generateNextMove(board, nextUnitToMove, Map({ target: previousTarget, direction: previousDirection }));
    } else {
      if (f.isUndefined(nextUnitToMove)) {
        console.log('Unit is undefined');
      }
      nextMoveResult = await BattleJS.generateNextMove(board, nextUnitToMove);
    }
    const result = await nextMoveResult;
    board = result.get('newBoard');
    const moveAction = result.get('nextMove').get('action');
    let pos = nextUnitToMove;
    // Calc nextMove value
    let nextMoveValue;
    if (moveAction === 'move') { // Faster recharge on moves
      nextMoveValue = +unit.get('next_move') + Math.round(+unit.get('speed') / 3);
      pos = result.get('nextMove').get('target');
    } else {
      nextMoveValue = +unit.get('next_move') + +unit.get('speed');
      // Add to dpsBoard
      if (unit.get('team') === 0) {
        dmgBoard = dmgBoard.set(unit.get('displayName'), (dmgBoard.get(unit.get('displayName')) || 0) + result.get('nextMove').get('value'));
      }
    }
    board = board.setIn([pos, 'next_move'], nextMoveValue);
    // console.log('Updating next_move', nextMoveValue, board.get(pos));
    const madeMove = result.get('nextMove').set('time', unit.get('next_move'));
    if (f.isUndefined(board)) {
      console.log('@startBattle CHECK ME', madeMove, board);
    }
    f.printBoard(board, madeMove);
    if (moveAction !== 'noAction') { // Is a valid action
      actionStack = actionStack.push(madeMove);
      if (result.get('allowSameMove')) { // Store target to be used as next Target
        unitMoveMap = unitMoveMap.set(nextUnitToMove, result);
      } else { // Unit died, Delete every key mapping to nextMoveResult
        const nextMoveAction = moveAction;
        if (nextMoveAction === 'attack' || nextMoveAction === 'spell') { // Unit attacked died
          // console.log('Deleting all keys connected to this: ', nextMoveResult.get('nextMove').get('target'))
          unitMoveMap = await UnitJS.deleteNextMoveResultEntries(unitMoveMap, result.get('nextMove').get('target'));
        } else if (nextMoveAction === 'move') { // Unit moved, remove units that used to attack him
          // console.log('Deleting all keys connected to this: ', nextUnitToMove)
          unitMoveMap = await UnitJS.deleteNextMoveResultEntries(unitMoveMap, nextUnitToMove);
        } else {
          console.log('@nextMove, CHECK shouldnt get here', nextMoveAction, nextMoveAction !== 'noAction', moveAction !== 'noAction');
        }
      }
    }
    battleOver = result.get('battleOver');
    if (battleOver) break; // Breaks if battleover (no dot damage if last unit standing)
    // Dot damage
    const team = board.getIn([nextUnitToMove, 'team']);
    const dotObj = await _handleDotDamage(board, nextUnitToMove, team);
    if (!f.isUndefined(dotObj.get('damage'))) {
      console.log('@Dot Damage');
      board = await dotObj.get('board');
      // console.log('@dotDamage battleover', battleOver, dotObj.get('battleOver'), battleOver || dotObj.get('battleOver'));
      const action = 'dotDamage';
      const dotDamage = dotObj.get('damage');
      // console.log('dot damage dealt!', board);
      let damageDealt = dotDamage;
      if (dotObj.get('unitDied')) { // Check if battle ends
        console.log('@dot - unitdied');
        damageDealt = dotObj.get('unitDied');
        battleOver = battleOver || await BattleJS.isBattleOver(board, 1 - team);
        // Delete every key mapping to nextMoveResult
        // console.log('Deleting all keys connected to this: ', nextMoveResult.get('nextMove').get('target'))
        unitMoveMap = await UnitJS.deleteNextMoveResultEntries(unitMoveMap, nextUnitToMove);
      }
      const move = await Map({
        unitPos: nextUnitToMove, action, value: damageDealt, target: nextUnitToMove,
      });
      if (unit.get('team') === 1) {
        dmgBoard = dmgBoard.set('dot', (dmgBoard.get('dot') || 0) + damageDealt);
      }
      console.log('@dotDamage', dotDamage);
      f.printBoard(board, move);
      actionStack = actionStack.push(Map({ nextMove: move, newBoard: board }).set('time', unit.get('next_move')));
    }
  }
  const newBoard = await board;
  // Return the winner
  // f.print(newBoard, '@startBattle newBoard after');
  // f.print(actionStack, '@startBattle actionStack after');
  f.p('@Last - A Survivor', newBoard.keys().next().value, newBoard.get(newBoard.keys().next().value).get('name'));
  const team = newBoard.get(newBoard.keys().next().value).get('team');
  const winningTeam = team;
  const battleEndTime = actionStack.get(actionStack.size - 1).get('time');
  return Map({
    actionStack, board: newBoard, winner: winningTeam, dmgBoard, battleEndTime,
  });
}

/** Public methods */
/**
 * Board for player with playerIndex have too many units
 * Try to withdraw the cheapest unit
 * if hand is full, sell cheapest unit
 * Do this until board.size == level
 */
BattleJS.fixTooManyUnits = async (state, playerIndex) => {
  const board = state.getIn(['players', playerIndex, 'board']);
  // Find cheapest unit
  const iter = board.keys();
  let temp = iter.next();
  let cheapestCost = 100;
  let cheapestCostIndex = List([]);
  while (!temp.done) {
    const unitPos = temp.value;
    const cost = (await pawns.getStats(board.get(unitPos).get('name'))).get('cost');
    if (cost < cheapestCost) {
      cheapestCost = cost;
      cheapestCostIndex = List([unitPos]);
    } else if (cost === cheapestCost) {
      cheapestCostIndex = cheapestCostIndex.push(unitPos);
    }
    temp = iter.next();
  }
  let chosenUnit;
  if (cheapestCostIndex.size === 1) {
    chosenUnit = cheapestCostIndex.get(0);
  } else {
    // TODO Check the one that provides fewest combos
    // Temp: Random from cheapest
    const chosenIndex = Math.random() * cheapestCostIndex.size;
    chosenUnit = cheapestCostIndex.get(chosenIndex);
  }
  // Withdraw if possible unit, otherwise sell
  // console.log('@FixTooManyUnits Check keys', state.get('players'));
  let newState;
  // TODO: Inform Client about update
  if (state.getIn(['players', playerIndex, 'hand']).size < 8) {
    console.log('WITHDRAWING PIECE', board.get(chosenUnit).get('name'));
    newState = await BoardJS.withdrawPiece(state, playerIndex, chosenUnit);
  } else {
    console.log('SELLING PIECE', board.get(chosenUnit).get('name'));
    newState = await BoardJS.sellPiece(state, playerIndex, chosenUnit);
  }
  const newBoard = newState.getIn(['players', playerIndex, 'board']);
  const level = newState.getIn(['players', playerIndex, 'level']);
  if (newBoard.size > level) {
    return BattleJS.fixTooManyUnits(newState, playerIndex);
  }
  return newState.getIn(['players', playerIndex]);
};

/**
 * Spawn opponent in reverse board
 * Mark owners of units
 * Start battle
 */
BattleJS.prepareBattle = async (board1, board2) => {
  // Check to see if a battle is required
  // Lose when empty, even if enemy no units aswell (tie with no damage taken)
  const board = await BoardJS.combineBoards(board1, board2);
  if (board1.size === 0) {
    return Map({
      actionStack: List([]), winner: 1, board, startBoard: board,
    });
  } if (board2.size === 0) {
    return Map({
      actionStack: List([]), winner: 0, board, startBoard: board,
    });
  }

  // f.print(board, '@prepareBattle')
  // Both players have units, battle required
  const boardWithBonuses = (await BoardJS.markBoardBonuses(board)).get('newBoard');
  // f.print(boardWithBonuses);
  const boardWithMovement = await _setRandomFirstMove(boardWithBonuses);
  if (f.isUndefined(boardWithMovement)) {
    console.log('@prepareBattle UNDEFINED BOARD', board1, board2);
  }
  const result = await _startBattle(boardWithMovement);
  return result.set('startBoard', boardWithMovement);
};

BattleJS.npcRound = async (stateParam, npcBoard) => {
  const state = stateParam;
  let battleObject = Map({});
  const playerIter = state.get('players').keys();
  let tempPlayer = playerIter.next();
  // TODO: Future: All battles calculate concurrently
  while (!tempPlayer.done) {
    const currentPlayer = tempPlayer.value;
    const board1 = state.getIn(['players', currentPlayer, 'board']);
    // {actionStack: actionStack, board: newBoard, winner: winningTeam, startBoard: initialBoard}
    const resultBattle = await BattleJS.prepareBattle(board1, npcBoard);

    const actionStack = resultBattle.get('actionStack');
    const startBoard = resultBattle.get('startBoard');
    const dmgBoard = resultBattle.get('dmgBoard');
    battleObject = battleObject.setIn(['actionStacks', currentPlayer], actionStack);
    battleObject = battleObject.setIn(['startingBoards', currentPlayer], startBoard);
    battleObject = battleObject.setIn(['dmgBoards', currentPlayer], dmgBoard);

    // For endbattle calculations
    const winner = (resultBattle.get('winner') === 0);
    const finalBoard = resultBattle.get('board');
    const battleEndTime = resultBattle.get('battleEndTime');
    battleObject = battleObject.setIn(['winners', currentPlayer], winner);
    battleObject = battleObject.setIn(['finalBoards', currentPlayer], finalBoard);
    battleObject = battleObject.setIn(['battleEndTimes', currentPlayer], battleEndTime);

    tempPlayer = playerIter.next();
  }
  // Post battle state
  const newState = await state;
  return Map({
    state: newState,
    battleObject,
    preBattleState: stateParam,
  });
};

async function buildMatchups(players) {
  let matchups = Map({});
  const jsPlayers = players.toJS();
  const keys = Object.keys(jsPlayers);
  const immutableKeys = fromJS(keys);
  console.log('immutableKeys', immutableKeys);
  let shuffledKeys = f.shuffleImmutable(immutableKeys);
  console.log('shuffledKeys', shuffledKeys);
  // console.log('@buildMatchups Keys', players, keys, shuffledKeys);
  for (let i = shuffledKeys.size - 1; i > 2; i -= 2) {
    const pid = shuffledKeys.get(i);
    const otherpid = shuffledKeys.get(i - 1);
    matchups = matchups.set(pid, otherpid).set(otherpid, pid);
    shuffledKeys = shuffledKeys.delete(i).delete(i - 1);
  }
  if (shuffledKeys.size === 3) {
    const fst = shuffledKeys.get(0);
    const snd = shuffledKeys.get(1);
    const trd = shuffledKeys.get(2);
    matchups = matchups.set(fst, snd).set(snd, trd).set(trd, fst);
  } else if (shuffledKeys.size === 2) {
    const fst = shuffledKeys.get(0);
    const snd = shuffledKeys.get(1);
    matchups = matchups.set(fst, snd).set(snd, fst);
  }
  console.log('@buildMatchups -------', matchups);
  return matchups;
}

/**
 * Randomize Opponents for state
 * TODO: Randomize opponent pairs, shuffle indexes before iterator
 *    Make a system so people have higher odds of meeting each other at the same time
 * Temp: Always face next player in order
 * * Assumes board contains every player's updated board
 */
BattleJS.battleTime = async (stateParam) => {
  let state = stateParam;
  const matchups = await buildMatchups(state.get('players'));
  let battleObject = Map({ matchups });
  const iter = matchups.keys();
  let temp = iter.next();
  while (!temp.done) {
    const index = temp.value;
    const enemy = matchups.get(temp.value);
    // console.log('@battleTime pairing: ', pairing, nextPlayer);
    const board1 = state.getIn(['players', index, 'board']);
    const board2 = state.getIn(['players', enemy, 'board']);
    if (f.isUndefined(board2)) console.log('Undefined board', enemy);
    // {actionStack: actionStack, board: newBoard, winner: winningTeam, startBoard: initialBoard}
    const resultBattle = await BattleJS.prepareBattle(board1, board2);

    // For visualization of battle
    const actionStack = resultBattle.get('actionStack');
    const startBoard = resultBattle.get('startBoard');
    const dmgBoard = resultBattle.get('dmgBoard');
    battleObject = battleObject.setIn(['actionStacks', index], actionStack);
    battleObject = battleObject.setIn(['startingBoards', index], startBoard);
    battleObject = battleObject.setIn(['dmgBoards', index], dmgBoard);

    // For endbattle calculations
    const winner = (resultBattle.get('winner') === 0);
    const finalBoard = resultBattle.get('board');
    const battleEndTime = resultBattle.get('battleEndTime');
    battleObject = battleObject.setIn(['winners', index], winner);
    battleObject = battleObject.setIn(['finalBoards', index], finalBoard);
    battleObject = battleObject.setIn(['battleEndTimes', index], battleEndTime);


    // console.log('@battleTime newBoard, finished board result', newBoard); // Good print, finished board
    // Store rivals logic
    const prevRivals = state.getIn(['players', index, 'rivals']);
    state = state.setIn(['players', index, 'rivals'], prevRivals.set(enemy, (prevRivals.get(enemy) || 0) + 1));

    temp = iter.next();
  }
  // Post battle state
  const newState = await state;
  return Map({
    state: newState,
    battleObject,
    preBattleState: stateParam,
  });
};

/**
 * Check not too many units on board
 * Calculate battle for given board, either pvp or npc/gym round
 */
BattleJS.battleSetup = async (stateParam) => {
  let state = stateParam;
  const iter = state.get('players').keys();
  let temp = iter.next();
  while (!temp.done) {
    const playerIndex = temp.value;
    const board = state.getIn(['players', playerIndex, 'board']);
    const level = state.getIn(['players', playerIndex, 'level']);
    if (board.size > level) {
      const newPlayer = await BattleJS.fixTooManyUnits(state, playerIndex);
      state = state.setIn(['players', playerIndex], newPlayer);
    }
    temp = iter.next();
  }
  const round = state.get('round');
  const roundType = gameConstantsJS.getRoundType(round);
  switch (roundType) {
    case 'gym': {
      const gymLeader = gameConstantsJS.getGymLeader(round);
      const boardNpc = await gameConstantsJS.getSetRound(round);
      return (await BattleJS.npcRound(state, boardNpc)).set('roundType', roundType).set('gymLeader', gymLeader);
    }
    case 'npc': {
      const boardNpc = await gameConstantsJS.getSetRound(round);
      return (await BattleJS.npcRound(state, boardNpc)).set('roundType', roundType);
    }
    case 'shop':
    case 'pvp':
    default: {
      return (await BattleJS.battleTime(state)).set('roundType', roundType);
    }
  }
};

/**
 * Is battle over?
 */
BattleJS.isBattleOver = async (board, team) => {
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
};

/**
 * Remove hp from unit
 * Remove unit if hp <= 0
 * Percent currently not used, hp to remove calculated before hand
 * ({board, unitDied})
 */
BattleJS.removeHpBattle = async (board, unitPos, hpToRemove, percent = false) => {
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
BattleJS.generateNextMove = async (board, unitPos, optPreviousTarget) => {
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
    const enemyPos = UnitJS.getClosestEnemy(board, unitPos, range, team);
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

module.exports = BattleJS;
