const {
  Map,
  List,
  Set,
  fromJS,
} = require('immutable');
const deckJS = require('../deck');
const pawns = require('../pawns');
const playerJS = require('../player');
const f = require('../f');
const gameConstantsJS = require('../game_constants');
const BattlefieldJS = require('./battlefield');
const typesJS = require('../types');

const BattleJS = {};

/**
 * Give bonuses from types
 * Type bonus is either only for those of that type or all units
 */
BattleJS.markBoardBonuses = async (board, teamParam = '0') => {
  const buffMap = await BattlefieldJS.countUniqueOccurences(board);

  // Map({0: Map({grass: 40})})
  let typeBuffMapSolo = Map({ 0: Map({}), 1: Map({}) }); // Solo buffs, only for that type
  let typeBuffMapAll = Map({ 0: Map({}), 1: Map({}) }); // For all buff
  let typeDebuffMapEnemy = Map({ 0: Map({}), 1: Map({}) }); // For all enemies debuffs
  // Find if any bonuses need applying
  for (let i = 0; i <= 1; i++) {
    const buffsKeysIter = buffMap.get(String(i)).keys();
    let tempBuff = buffsKeysIter.next();
    while (!tempBuff.done) {
      const buff = tempBuff.value;
      const amountBuff = buffMap.get(String(i)).get(buff);
      for (let j = 1; j <= 3; j++) {
        if (typesJS.hasBonus(buff) && amountBuff >= typesJS.getTypeReq(buff, j)) {
          // console.log('@markBoardBonuses', amountBuff, typesJS.getTypeReq(buff, i))
          switch (typesJS.getBonusType(buff)) {
            case 'bonus':
              typeBuffMapSolo = typeBuffMapSolo
                .setIn([String(i), buff, 'value'], (typeBuffMapSolo.get(String(i)).get(buff) ? typeBuffMapSolo.get(String(i)).get(buff).get('value') : 0) + typesJS.getBonusAmount(buff, j))
                .setIn([String(i), buff, 'typeBuff'], typesJS.getBonusStatType(buff))
                .setIn([String(i), buff, 'tier'], j);
              break;
            case 'allBonus':
              typeBuffMapAll = typeBuffMapAll
                .setIn([String(i), buff, 'value'], (typeBuffMapAll.get(String(i)).get(buff) ? typeBuffMapAll.get(String(i)).get(buff).get('value') : 0) + typesJS.getBonusAmount(buff, j))
                .setIn([String(i), buff, 'typeBuff'], typesJS.getBonusStatType(buff))
                .setIn([String(i), buff, 'tier'], j);
              break;
            case 'enemyDebuff':
              typeDebuffMapEnemy = typeDebuffMapEnemy
                .setIn([String(i), buff, 'value'], (typeDebuffMapEnemy.get(String(i)).get(buff) ? typeDebuffMapEnemy.get(String(i)).get(buff).get('value') : 0) + typesJS.getBonusAmount(buff, j))
                .setIn([String(i), buff, 'typeBuff'], typesJS.getBonusStatType(buff))
                .setIn([String(i), buff, 'tier'], j);
              break;
            case 'noBattleBonus':
              // No impact in battle
              break;
            default:
              console.log(`Ability bonus type error ... Error found for ${typesJS.getBonusType(buff)}`);
              process.exit();
          }
        } else {
          break;
        }
      }
      tempBuff = buffsKeysIter.next();
    }
  }

  // Apply buff
  const boardKeysIter = board.keys();
  let tempUnit = boardKeysIter.next();
  let newBoard = board;
  while (!tempUnit.done) {
    const unitPos = tempUnit.value;
    const unit = board.get(unitPos);
    newBoard = newBoard.setIn([unitPos, 'buff'], List([]));
    const team = unit.get('team') || teamParam;
    // Solo buffs
    const types = board.get(unitPos).get('type'); // Value or List
    if (!f.isUndefined(types.size)) { // List
      let newUnit = unit;
      for (let i = 0; i < types.size; i++) {
        if (!f.isUndefined(typeBuffMapSolo.get(String(team)).get(types.get(i)))) {
          // console.log('@markBoardBonuses Marking unit', newUnit.get('name'));
          const buff = typesJS.getType(types.get(i));
          const buffName = buff.get('name');
          const bonusValue = typeBuffMapSolo.get(String(team)).get(types.get(i)).get('value');
          const bonusType = buff.get('bonusStatType');
          const buffTextContent = (bonusType.includes('unique') ? bonusType.split('_')[1] + bonusValue : `${bonusType} +${bonusValue}`);
          const buffText = `${buffName}: ${buffTextContent}`;
          newUnit = (await typesJS.getBuffFuncSolo(types.get(i))(newUnit, bonusValue))
            .set('buff', (newBoard.get(unitPos).get('buff') || List([])).push(buffText)); // Add buff to unit
          newBoard = await newBoard.set(unitPos, newUnit);
        }
      }
    } else if (!f.isUndefined(typeBuffMapSolo.get(String(team)).get(types))) {
      // console.log('@markBoardBonuses Marking unit', unit.get('name'));
      const buff = typesJS.getType(types);
      const buffName = buff.get('name');
      const bonusValue = typeBuffMapSolo.get(String(team)).get(types).get('value');
      const bonusType = buff.get('bonusStatType');
      const buffTextContent = (bonusType.includes('unique') ? bonusType.split('_')[1] + bonusValue : `${bonusType} +${bonusValue}`);
      const buffText = `${buffName}: ${buffTextContent}`;
      const newUnit = (await typesJS.getBuffFuncSolo(types)(unit, bonusValue))
        .set('buff', (newBoard.get(unitPos).get('buff') || List([])).push(buffText)); // Add buff to unit
      newBoard = await newBoard.set(unitPos, newUnit);
    }

    // All buffs
    const allBuffIter = typeBuffMapAll.get(String(team)).keys();
    let tempBuffAll = allBuffIter.next();
    while (!tempBuffAll.done) {
      const buff = tempBuffAll.value;
      const bonusValue = typeBuffMapAll.get(String(team)).get(buff).get('value');
      const bonusType = typesJS.getBonusStatType(buff);
      const buffText = `${buff}: ${bonusType} +${bonusValue}`;
      const newUnit = typesJS.getBuffFuncAll(buff)(newBoard.get(unitPos), bonusValue)
        .set('buff', (newBoard.get(unitPos).get('buff') || List([])).push(buffText));
      newBoard = await newBoard.set(unitPos, newUnit);
      tempBuffAll = allBuffIter.next();
    }

    // Enemy buffs
    const enemyTeam = 1 - team;
    const enemyDebuffIter = typeDebuffMapEnemy.get(String(enemyTeam)).keys();
    let tempEnemy = enemyDebuffIter.next();
    while (!tempEnemy.done) {
      const buff = tempEnemy.value;
      const bonusValue = typeDebuffMapEnemy.get(String(enemyTeam)).get(buff).get('value');
      const bonusType = typesJS.getBonusStatType(buff);
      const buffText = `${buff}: ${bonusType} +${bonusValue}`;
      const newUnit = typesJS.getEnemyDebuff(buff)(newBoard.get(unitPos), bonusValue)
        .set('buff', (newBoard.get(unitPos).get('buff') || List([])).push(buffText));
      newBoard = await newBoard.set(unitPos, newUnit);
      tempEnemy = enemyDebuffIter.next();
    }
    tempUnit = boardKeysIter.next();
  }
  if (f.isUndefined(newBoard) || Object.keys(newBoard).length === 0) {
    console.log('@markBoardBonuses CHECK ME', newBoard);
  }
  // console.log('NEWBOARD: ', newBoard);
  return Map({
    newBoard, buffMap, typeBuffMapSolo, typeBuffMapAll, typeDebuffMapEnemy,
  });
}

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
    newState = await BattlefieldJS.withdrawPiece(state, playerIndex, chosenUnit);
  } else {
    console.log('SELLING PIECE', board.get(chosenUnit).get('name'));
    newState = await BattlefieldJS.sellPiece(state, playerIndex, chosenUnit);
  }
  const newBoard = newState.getIn(['players', playerIndex, 'board']);
  const level = newState.getIn(['players', playerIndex, 'level']);
  if (newBoard.size > level) {
    return BattleJS.fixTooManyUnits(newState, playerIndex);
  }
  return newState.getIn(['players', playerIndex]);
};

/**
 * Battle:
 * Grab next unit to move
 * simulate next move for that unit and calculate new board
 * add that move to actionStack
 * Continue until battle over
 */
async function startBattle(boardParam) {
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
      battleOver = battleOver || await isBattleOver(board, 1 - unit.get('team'));
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
    const nextUnitToMove = await getUnitWithNextMove(board);
    const unit = board.get(nextUnitToMove);
    // console.log('\n@startbattle Next unit to do action: ', nextUnitToMove);
    const previousMove = unitMoveMap.get(nextUnitToMove);
    // console.log(' --- ', (f.isUndefined(previousMove) ? '' : previousMove.get('nextMove').get('target')), nextUnitToMove)
    let nextMoveResult;
    if (!f.isUndefined(previousMove)) { // Use same target as last round
      // console.log('previousMove in @startBattle', previousMove.get('nextMove').get('target'));
      const previousTarget = previousMove.get('nextMove').get('target');
      const previousDirection = previousMove.get('nextMove').get('direction');
      nextMoveResult = await nextMove(board, nextUnitToMove, Map({ target: previousTarget, direction: previousDirection }));
    } else {
      if (f.isUndefined(nextUnitToMove)) {
        console.log('Unit is undefined');
      }
      nextMoveResult = await nextMove(board, nextUnitToMove);
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
          unitMoveMap = await deleteNextMoveResultEntries(unitMoveMap, result.get('nextMove').get('target'));
        } else if (nextMoveAction === 'move') { // Unit moved, remove units that used to attack him
          // console.log('Deleting all keys connected to this: ', nextUnitToMove)
          unitMoveMap = await deleteNextMoveResultEntries(unitMoveMap, nextUnitToMove);
        } else {
          console.log('@nextMove, CHECK shouldnt get here', nextMoveAction, nextMoveAction !== 'noAction', moveAction !== 'noAction');
        }
      }
    }
    battleOver = result.get('battleOver');
    if (battleOver) break; // Breaks if battleover (no dot damage if last unit standing)
    // Dot damage
    const team = board.getIn([nextUnitToMove, 'team']);
    const dotObj = await handleDotDamage(board, nextUnitToMove, team);
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
        battleOver = battleOver || await isBattleOver(board, 1 - team);
        // Delete every key mapping to nextMoveResult
        // console.log('Deleting all keys connected to this: ', nextMoveResult.get('nextMove').get('target'))
        unitMoveMap = await deleteNextMoveResultEntries(unitMoveMap, nextUnitToMove);
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

/**
 * Spawn opponent in reverse board
 * Mark owners of units
 * Start battle
 */
BattleJS.prepareBattle = async (board1, board2) => {
  // Check to see if a battle is required
  // Lose when empty, even if enemy no units aswell (tie with no damage taken)
  const board = await combineBoards(board1, board2);
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
  const boardWithBonuses = (await BattleJS.markBoardBonuses(board)).get('newBoard');
  // f.print(boardWithBonuses);
  const boardWithMovement = await setRandomFirstMove(boardWithBonuses);
  if (f.isUndefined(boardWithMovement)) {
    console.log('@prepareBattle UNDEFINED BOARD', board1, board2);
  }
  const result = await startBattle(boardWithMovement);
  return result.set('startBoard', boardWithMovement);
}

BattleJS.npcRound = async (stateParam, npcBoard) => {
  const state = stateParam;
  let battleObject = Map({});
  const playerIter = state.get('players').keys();
  let tempPlayer = playerIter.next();
  // TODO: Future: All battles calculate concurrently
  while (!tempPlayer.done) {
    const currentPlayer = tempPlayer.value;
    const board1 = state.getIn(['players', currentPlayer, 'board']);
    const result = BattleJS.prepareBattle(board1, npcBoard);
    // {actionStack: actionStack, board: newBoard, winner: winningTeam, startBoard: initialBoard}
    const resultBattle = await result;

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
    const result = BattleJS.prepareBattle(board1, board2);
    // {actionStack: actionStack, board: newBoard, winner: winningTeam, startBoard: initialBoard}
    const resultBattle = await result;

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
}

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

module.exports = BattleJS;