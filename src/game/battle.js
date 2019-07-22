const {
  Map,
  List,
  fromJS,
} = require('immutable');
const pawns = require('../pawns');
const f = require('../f');
const gameConstantsJS = require('../game_constants');
const StateJS = require('./state');
const BoardJS = require('./board');
const UnitJS = require('./unit');

const BattleJS = {};

/** Private methods */

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
 * Given a list of units, calculate damage to be removed from player
 * 1 point per level of unit
 * Units level is currently their cost
 * TODO: Balanced way of removing hp (level is exponentially bad for many units)
 */
async function _calcDamageTaken(boardUnits) {
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
async function _removeHp(state, playerIndex, hpToRemove) {
  const currentHp = state.getIn(['players', playerIndex, 'hp']);
  if (currentHp - hpToRemove <= 0) {
    return state.setIn(['players', playerIndex, 'dead'], true);
  }
  return state.setIn(['players', playerIndex, 'hp'], currentHp - hpToRemove);
}

/**
 * Builds new state after battles
 */
let synchronizedPlayers = Map({}); // Investigate what is that??
async function _prepEndTurn(state, playerIndex) {
  synchronizedPlayers = synchronizedPlayers.set(playerIndex, state.getIn(['players', playerIndex]));
  if (synchronizedPlayers.size === state.get('amountOfPlayers')) {
    console.log('@prepEndTurn CHECK: Ending Turn', state.get('amountOfPlayers'));
    const newState = state.set('players', synchronizedPlayers); // Set
    synchronizedPlayers = Map({});
    const newRoundState = await StateJS.endTurn(newState);
    return Map({
      state: newRoundState,
      last: true
    });
  }
  return Map({
    state,
    last: false
  });
}

/**
 * winner: Gain 1 gold
 * loser: Lose hp
 *      Calculate amount of hp to lose
 * Parameters: Enemy player index, winningAmount = damage? (units or damage)
 */
const _endBattle = async (stateParam, playerIndex, winner, finishedBoard, roundType, enemyPlayerIndex) => {
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
        const hpToRemove = await _calcDamageTaken(finishedBoard);
        state = await _removeHp(state, playerIndex, hpToRemove);
        f.p('@endBattle Lost Player', playerIndex, hpToRemove);
        break;
      }
      case 'gym': {
        const hpToRemove = await _calcDamageTaken(finishedBoard);
        const gymDamage = Math.min(hpToRemove, 3);
        state = await _removeHp(state, playerIndex, gymDamage);
        f.p('@endBattle Gymbattle');
      }
      case 'shop':
      default:
    }
  }
  // console.log('@endBattle prep', stateParam.get('players'));
  const potentialEndTurnObj = await _prepEndTurn(state, playerIndex);
  return potentialEndTurnObj;
};

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
      nextMoveResult = await UnitJS.generateNextMove(board, nextUnitToMove, Map({ target: previousTarget, direction: previousDirection }));
    } else {
      if (f.isUndefined(nextUnitToMove)) {
        console.log('Unit is undefined');
      }
      nextMoveResult = await UnitJS.generateNextMove(board, nextUnitToMove);
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

BattleJS.endBattleForAll = async (stateParam, winners, finalBoards, matchups, roundType) => {
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
    const newStateAfterBattleObj = await _endBattle(tempState, tempIndex, winner, finalBoard, roundType, enemy);
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

module.exports = BattleJS;
