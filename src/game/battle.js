const _ = require('lodash');
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
  return { board: board.setIn([unitPos, 'hp'], newHp), hpHealed };
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
  let manaChanges = {};
  const unitMana = board.get(unitPos)['mana'];
  const unitManaMult = board.get(unitPos).get('mana_multiplier');
  const unitManaInc = Math.round(Math.min(Math.max(unitManaMult * damage, 5), 15)); // Move 5 and 15 to pokemon.js
  const manaCost = board.get(unitPos).get('manaCost');
  const newMana = Math.min(+unitMana + +unitManaInc, manaCost);
  manaChanges = manaChanges.set(unitPos, newMana);
  if (!f.isUndefined(enemyPos)) {
    const enemyMana = board.get(enemyPos)['mana'];
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
  const manaCost = ability['mana'] || abilitiesJS.getAbilityDefault('mana');
  const newMana = board[unitPos].mana - manaCost;
  const manaChanges = { unitPos: newMana };
  board[unitPos].mana = newMana;
  let effectMap = {};
  if (!f.isUndefined(ability['effect'])) {
    const effect = ability['effect'];
    const mode = (f.isUndefined(effect.length) ? effect : effect[0]);
    const args = (f.isUndefined(effect.length) ? undefined : effect.shift(0));
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
        // return { board: { board: newBoard }) };
        break;
      }
      case 'lifesteal': {
        const lsFactor = (!f.isUndefined(args) ? args.get(0) : abilitiesJS.getAbilityDefault('lifestealValue'));
        const healObj = await _healUnit(newBoard, unitPos, Math.round(lsFactor * damage));
        newBoard = healObj['board'];
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
  return { removeHpBoard: (await BattleJS.removeHpBattle(newBoard, target, damage)), effect: effectMap, manaChanges };
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
 * Returns {board, damage, unitDied})
 */
async function _handleDotDamage(board, unitPos) {
  const dot = board.getIn([unitPos, 'dot']);
  if (!f.isUndefined(dot)) {
    const dmgHp = await _dmgPercToHp(board, unitPos, dot);
    const removedHPBoard = await BattleJS.removeHpBattle(board, unitPos, dmgHp); // {board, unitDied}
    const newBoard = removedHPBoard['board'];
    return { board: newBoard, damage: dmgHp, unitDied: removedHPBoard['unitDied'] };
  }
  return { board };
}


/**
 * Battle:
 * Grab next unit to move
 * simulate next move for that unit and calculate new board
 * add that move to actionStack
 * Continue until battle over
 */
async function _executeBattle(preBattleBoard) {
  let actionStack = [];
  let dmgBoard = {};
  let board = _.clone(preBattleBoard);
  let battleOver = false;

  // First move for all units first
  // First move used for all units (order doesn't matter) and set next_move to + speed accordingly
  // Update actionStack and board accordingly
  for (const unitPos in board) {
    const unit = board[unitPos];
    const action = 'move';
    if (unit['hp'] <= 0) {
      // shouldnt happen on game start tho...
      delete board[unitPos];
      battleOver = battleOver || await BattleJS.isBattleOver(board, 1 - unit['team']);
    } else {
      const target = unit['team'] === 0 ? 'S' : 'N'; // todo
      const time = 0;
      const move = {
        unitPos, action, target, time,
      };
      actionStack.push(move);
      board[unitPos]['next_action'] = unit['speed'];
    }
  }

  // Start battle (todo this async or in workers or somehow optimized)
  let unitMoveMap = {};
  while (!battleOver) {
    const nextUnitToMove = await BoardJS.getPositionForUnitWithNextMove(board);
    const unit = board[nextUnitToMove];
    const previousMove = unitMoveMap[nextUnitToMove];

    let nextMoveResult;
    if (!f.isUndefined(previousMove)) { // Use same target as last round
      // console.log('previousMove in @startBattle', previousMove.get('nextMove').get('target'));
      const previousTarget = previousMove['nextMove']['target'];
      const previousDirection = previousMove['nextMove']['direction'];
      nextMoveResult = await BattleJS.generateNextMove(board, nextUnitToMove, { target: previousTarget, direction: previousDirection });
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
        dmgBoard = dmgBoard.set(unit['displayName'], (dmgBoard.get(unit['displayName']) || 0) + result.get('nextMove').get('value'));
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
      board = await dotObj['board'];
      // console.log('@dotDamage battleover', battleOver, dotObj.get('battleOver'), battleOver || dotObj.get('battleOver'));
      const action = 'dotDamage';
      const dotDamage = dotObj.get('damage');
      // console.log('dot damage dealt!', board);
      let damageDealt = dotDamage;
      if (dotObj['unitDied']) { // Check if battle ends
        console.log('@dot - unitdied');
        damageDealt = dotObj['unitDied'];
        battleOver = battleOver || await BattleJS.isBattleOver(board, 1 - team);
        // Delete every key mapping to nextMoveResult
        // console.log('Deleting all keys connected to this: ', nextMoveResult.get('nextMove').get('target'))
        unitMoveMap = await UnitJS.deleteNextMoveResultEntries(unitMoveMap, nextUnitToMove);
      }
      const move = await {
        unitPos: nextUnitToMove, action, value: damageDealt, target: nextUnitToMove,
      };
      if (unit.get('team') === 1) {
        dmgBoard = dmgBoard.set('dot', (dmgBoard.get('dot') || 0) + damageDealt);
      }
      console.log('@dotDamage', dotDamage);
      f.printBoard(board, move);
      actionStack = actionStack.push({ nextMove: move, newBoard: board }).set('time', unit.get('next_move'));
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
  return {
    actionStack, board: newBoard, winner: winningTeam, dmgBoard, battleEndTime,
  };
}

/** Public methods */
/**
 * Board for player with playerIndex have too many units
 * Try to withdraw the cheapest unit
 * if hand is full, sell cheapest unit
 * Do this until board.size == level
 */
BattleJS.mutateStateByFixingUnitLimit = async (state, playerIndex) => {
  const board = state.getIn(['players', playerIndex, 'board']);
  // Find cheapest unit
  const iter = board.keys();
  let temp = iter.next();
  let cheapestCost = 100;
  let cheapestCostIndex = [];
  while (!temp.done) {
    const unitPos = temp.value;
    const cost = (await pawns.getStats(board.get(unitPos).get('name'))).get('cost');
    if (cost < cheapestCost) {
      cheapestCost = cost;
      cheapestCostIndex = [unitPos];
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
BattleJS.executeBattle = async (board1, board2) => {
  // Check to see if a battle is required
  // Lose when empty, even if enemy no units aswell (tie with no damage taken)
  const board = await BoardJS.combineBoards(board1, board2);
  if (!Object.keys(board1).length) {
    return {
      actionStack: [], winner: 1, board, startBoard: board,
    };
  } if (!Object.keys(board2).length) {
    return {
      actionStack: [], winner: 0, board, startBoard: board,
    };
  } // todo case when both boards are empty?

  // Both players have units, battle required
  // const boardWithBonuses = (await BoardJS.markBoardBonuses(board))['board']; todo
  const result = await _executeBattle(board);
  return result.set('startBoard', board);
};

BattleJS.npcRound = async (state, players, npcBoard) => {
  const battleObject = {}; // investigate if we need all of this

  // TODO: Future: All battles calculate concurrently
  for (let i = 0; i < players.length; i++) {
    const playerBoard = state.getIn(['players', players[i], 'board']);
    const resultBattle = await BattleJS.executeBattle(playerBoard, npcBoard);
    battleObject['actionStacks'][players[i]] = resultBattle['actionStacks'];
    battleObject['startBoard'][players[i]] = resultBattle['startBoard'];
    battleObject['dmgBoards'][players[i]] = resultBattle['dmgBoards'];
    battleObject['winners'][players[i]] = resultBattle['winner'] === 0;
    battleObject['finalBoards'][players[i]] = resultBattle['board'];
    battleObject['battleEndTimes'][players[i]] = resultBattle['battleEndTime'];
  }

  return battleObject;
};

async function buildMatchups(players) {
  let matchups = {};
  const jsPlayers = players.toJS();
  const keys = Object.keys(jsPlayers);
  const immutableKeys = keys;
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
  let battleObject = { matchups };
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
    const resultBattle = await BattleJS.executeBattle(board1, board2);

    // For visualization of battle
    const actionStack = resultBattle.get('actionStack');
    const startBoard = resultBattle.get('startBoard');
    const dmgBoard = resultBattle.get('dmgBoard');
    battleObject = battleObject.setIn(['actionStacks', index], actionStack);
    battleObject = battleObject.setIn(['startingBoards', index], startBoard);
    battleObject = battleObject.setIn(['dmgBoards', index], dmgBoard);

    // For endbattle calculations
    const winner = (resultBattle.get('winner') === 0);
    const finalBoard = resultBattle['board'];
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
  return {
    state: newState,
    battleObject,
    preBattleState: stateParam,
  };
};

/**
 * Check not too many units on board
 * Calculate battle for given board, either pvp or npc/gym round
 */
BattleJS.battleSetup = async (state) => {
  const players = Object.keys(state.get('players')); // maybe this should be moved to some iterable logic
  for (let i = 0; i < players.length; i++) {
    const player = state.getIn(['players', players[i]]);
    if (Object.keys(player.board).length > player.level) {
      await BattleJS.mutateStateByFixingUnitLimit(state, players[i]);
    }
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
      const roundState = (await BattleJS.npcRound(state, players, boardNpc));
      roundState.set('roundType', roundType);
      return roundState;
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

    return { board: board.delete(unitPos), unitDied: currentHp };
  }
  // Caused a crash0
  if (Number.isNaN(currentHp - hpToRemove)) {
    console.log('Exiting (removeHpBattle) ... ', currentHp, hpToRemove, board.get(unitPos));
    console.log(hpToRemove);
    process.exit();
  }
  return { board: board.setIn([unitPos, 'hp'], newHp), unitDied: false };
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
 * {nextMove: {action: action, value: value, target: target}),
 * newBoard: newBoard, battleOver: true, allowSameMove: true})
 */
BattleJS.generateNextMove = async (board, unitPos, optPreviousTarget) => {
  const unit = board[unitPos];
  if (unit.mana >= unit.manaCost) { // Use spell, && withinRange for spell
    // TODO AOE spell logic
    // Idea: Around every adjacent enemy in range of 1 from closest enemy
    const team = unit.team;
    const ability = await abilitiesJS.getAbility(unit.name);
    // TODO Check aoe / notarget here instead
    // console.log('@spell ability', ability)
    if (f.isUndefined(ability)) {
      console.log(`${unit.name} buggy ability`);
    }
    let range = 1;
    if (ability) {
      range = (!f.isUndefined(ability.acc_range) && !f.isUndefined(ability.acc_range.size)
        ? ability.acc_range[1] : abilitiesJS.getAbilityDefault('range'));
    }
    const enemyPos = UnitJS.getClosestEnemy(board, unitPos, range, team);
    const action = 'spell';
    const target = await enemyPos['closestEnemy'];
    // console.log('@nextmove - ability target: ', target, enemyPos)
    const typeFactor = await typesJS.getTypeFactor(ability['type'], board[target]['type']);
    const abilityDamage = (ability['power'] ? await _calcDamage(action, ability['power'], unit, board[target], typeFactor, true) : 0);
    const abilityName = ability['displayName'];
    const abilityResult = await _useAbility(board, ability, abilityDamage, unitPos, target);
    // console.log('@abilityResult', abilityResult)
    const removedHPBoard = abilityResult['removeHpBoard'];
    const effect = abilityResult['effect'];
    const manaChanges = abilityResult['manaChanges'];
    // Do game over check
    const newBoard = removedHPBoard['board'];
    // console.log('@spell', newBoard)
    let battleOver = false;
    let damageDealt = abilityDamage;
    if (removedHPBoard['unitDied']) {
      battleOver = await BattleJS.isBattleOver(newBoard, team);
      damageDealt = removedHPBoard['unitDied'];
    }
    const move = {
      unitPos,
      action,
      value: damageDealt,
      abilityName,
      target,
      effect,
      manaChanges,
      typeEffective: gameConstantsJS.getTypeEffectString(typeFactor),
      direction: enemyPos.get('direction'),
    };

    return {
      nextMove: move,
      newBoard,
      battleOver,
    };
  }
  // Attack
  const range = unit.get('range');
  const team = unit.get('team');
  let tarpos;
  if (!f.isUndefined(optPreviousTarget)) {
    tarpos = { closestEnemy: optPreviousTarget.get('target'), withinRange: true, direction: optPreviousTarget.get('direction') };
  } else {
    tarpos = UnitJS.getClosestEnemy(board, unitPos, range, team);
  }
  const enemyPos = tarpos; // await
  if (enemyPos['withinRange']) { // Attack action
    const action = 'attack';
    const target = enemyPos['closestEnemy'];
    f.p('Closest Enemy: ', unitPos, team, target);
    const attackerType = (!f.isUndefined(unit['type'].length) ? unit['type'][0] : unit['type']);
    // console.log('@nextmove - normal attack target: ', target, enemyPos)
    const typeFactor = await typesJS.getTypeFactor(attackerType, board[target]['type']);
    const value = await _calcDamage(action, unit.get('attack'), unit, board[target], typeFactor);
    // Calculate newBoard from action
    const removedHPBoard = await BattleJS.removeHpBattle(board, target, value); // {board, unitDied}
    const newBoard = removedHPBoard['board'];
    let battleOver = false;
    let allowSameMove = false;
    let newBoardMana;
    let manaChanges;
    let damageDealt = value;
    if (removedHPBoard['unitDied']) { // Check if battle ends
      battleOver = await BattleJS.isBattleOver(newBoard, team);
      manaChanges = await _manaIncrease(newBoard, value, unitPos); // target = dead
      newBoardMana = await _manaChangeBoard(newBoard, manaChanges);
      damageDealt = removedHPBoard['unitDied'];
    } else { // Mana increase, return newBoard
      allowSameMove = true;
      manaChanges = await _manaIncrease(newBoard, value, unitPos, target);
      newBoardMana = await _manaChangeBoard(newBoard, manaChanges);
    }
    const move = {
      unitPos,
      action,
      value: damageDealt,
      target,
      manaChanges,
      typeEffective: gameConstantsJS.getTypeEffectString(typeFactor),
      direction: enemyPos.get('direction'),
    };
    return {
      nextMove: move,
      newBoard: newBoardMana,
      allowSameMove,
      battleOver,
    };
  } // Move action
  const closestEnemyPos = enemyPos['closestEnemy'];
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
  const move = {
    unitPos, action, target: movePos, direction,
  };
  return { nextMove: move, newBoard };
};

module.exports = BattleJS;
