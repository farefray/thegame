const _ = require('lodash');
const pawns = require('../pawns');
const f = require('../f');
const gameConstantsJS = require('../game_constants');
const abilitiesJS = require('../abilities');

const Battle = require('../objects/Battle');
const BoardJS = require('./board');

const BattleController = {};

/** Private methods */

/**
 * Heals unit at unitPos by heal amount, not over max hp
 */
async function _healUnit(board, unitPos, heal) {
  const maxHp = pawns.getMonsterStats(board.get(unitPos).get('name'))['hp'];
  const newHp = board.getIn([unitPos, 'hp']) + heal >= maxHp ? maxHp : board.getIn([unitPos, 'hp']) + heal;
  const hpHealed = newHp - board.getIn([unitPos, 'hp']);
  return {
    board: board.setIn([unitPos, 'hp'], newHp),
    hpHealed
  };
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
  const manaChanges = {
    unitPos: newMana
  };
  board[unitPos].mana = newMana;
  let effectMap = {};
  if (!f.isUndefined(ability['effect'])) {
    const effect = ability['effect'];
    const mode = f.isUndefined(effect.length) ? effect : effect[0];
    const args = f.isUndefined(effect.length) ? undefined : effect.shift(0);
    console.log('@useAbility mode', mode, ', args', args);
    switch (mode) {
      case 'buff': {
        if (!f.isUndefined(args)) {
          // Args: Use buff on self on board [buffType, amount]
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
        const lsFactor = !f.isUndefined(args) ? args.get(0) : abilitiesJS.getAbilityDefault('lifestealValue');
        const healObj = await _healUnit(newBoard, unitPos, Math.round(lsFactor * damage));
        newBoard = healObj['board'];
        effectMap = effectMap.setIn([unitPos, 'heal'], healObj.get('hpHealed'));
        break;
      }
      case 'dot': {
        const accuracy = !f.isUndefined(args) ? args.get(0) : abilitiesJS.getAbilityDefault('dotAccuracy');
        const dmg = !f.isUndefined(args) ? args.get(1) : abilitiesJS.getAbilityDefault('dotDamage');
        if (dmg > (newBoard.getIn([target, 'dot']) || 0)) {
          if (Math.random() < accuracy) {
            // Successfully puts poison
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
          if (r <= sum) {
            // 2-5 hits
            damage *= 2 + i;
            effectMap = effectMap.setIn([unitPos, 'multiStrike'], 2 + i);
            break;
          }
        }
        break;
      }
      default:
        console.log('@useAbility - default, mode =', mode);
    }
  }
  return {
    removeHpBoard: await BattleController.removeHpBattle(newBoard, target, damage),
    effect: effectMap,
    manaChanges
  };
}

/**
 * Convert damage in percentage to value
 */
async function _dmgPercToHp(board, unitPos, percentDmg) {
  const maxHp = pawns.getMonsterStats(board.get(unitPos).get('name'))['hp'];
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
    const removedHPBoard = await BattleController.removeHpBattle(board, unitPos, dmgHp); // {board, unitDied}
    const newBoard = removedHPBoard['board'];
    return {
      board: newBoard,
      damage: dmgHp,
      unitDied: removedHPBoard['unitDied']
    };
  }
  return {
    board
  };
}

/** Public methods */

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
    matchups = matchups
      .set(fst, snd)
      .set(snd, trd)
      .set(trd, fst);
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
BattleController.battleTime = async stateParam => {
  let state = stateParam;
  const matchups = await buildMatchups(state.get('players'));
  let battleObject = {
    matchups
  };
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
    const resultBattle = await BattleController.executeBattle(board1, board2);

    // For visualization of battle
    const actionStack = resultBattle.get('actionStack');
    const startBoard = resultBattle.get('startBoard');
    const dmgBoard = resultBattle.get('dmgBoard');
    battleObject = battleObject.setIn(['actionStack', index], actionStack);
    battleObject = battleObject.setIn(['startingBoards', index], startBoard);
    battleObject = battleObject.setIn(['dmgBoards', index], dmgBoard);

    // For endbattle calculations
    const winner = resultBattle.get('winner') === 0;
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
    preBattleState: stateParam
  };
};


/**
 * Check not too many units on board
 * Calculate battle for given board, either pvp or npc/gym round
 */
BattleController.setup = async state => {
  const players = Object.keys(state.get('players'));
  const round = state.get('round');
  console.log('TCL: BattleController.setup -> round', round);
  const npcBoard = await gameConstantsJS.getSetRound(round);

  // TODO: Future: All battles calculate concurrently, structurize this object maybe
  const results = {
    battleTime: 0,
    battles: {}
  }; // results for all battles and summary info

  let battleTime = 0;
  for (let i = 0; i < players.length; i++) {
    const playerBoard = state.getIn(['players', players[i], 'board']);
    // Check to see if a battle is required
    // Lose when empty, even if enemy no units aswell (tie with no damage taken)
    const board = await BoardJS.createBattleBoard(playerBoard, npcBoard);

    // Both players have units, battle required
    // const boardWithBonuses = (await BoardJS.markBoardBonuses(board))['board']; todo
    const battleResult = new Battle(board);

    results.battles[players[i]] = {
      actionStack: battleResult['actionStack'],
      startBoard: battleResult['startBoard'],
      winner: battleResult.winner, // actually should be boolean I guess, as every player will have own battleresult(todo)
      playerDamage: battleResult.playerDamage
    };

    if (battleResult['actionStack'].length) {
      const playerBattleTime = battleResult['actionStack'][battleResult['actionStack'].length - 1].time;
      if (playerBattleTime > battleTime) {
        battleTime = playerBattleTime;
      }
    }
  }

  results.battleTime = battleTime;
  return results;
  // todo pvp
  // return (await BattleController.battleTime(state));
};

/**
 * Is battle over?
 */
BattleController.isBattleOver = async (board, team) => {
  // console.log('@isBattleOver Check me', board, team)
  const keysIter = board.keys();
  let tempUnit = keysIter.next();
  while (!tempUnit.done) {
    // console.log('in battleover: ', board.get(tempUnit.value)['team'])
    if (board.get(tempUnit.value)['team'] === 1 - team) {
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
BattleController.removeHpBattle = async (board, unitPos, hpToRemove, percent = false) => {
  const currentHp = board.getIn([unitPos, 'hp']);
  // console.log('@removeHpBattle', hpToRemove)
  let newHp = currentHp - hpToRemove;
  if (percent) {
    const maxHp = pawns.getMonsterStats(board.get(unitPos).get('name'))['hp'];
    newHp = await Math.round(currentHp - maxHp * hpToRemove); // HptoRemove is percentage to remove
  }
  if (newHp <= 0) {
    f.p('@removeHpBattle UNIT DIED!', currentHp, '->', percent ? `${newHp}(%)` : `${newHp}(-)`);

    return {
      board: board.delete(unitPos),
      unitDied: currentHp
    };
  }
  // Caused a crash0
  if (Number.isNaN(currentHp - hpToRemove)) {
    console.log('Exiting (removeHpBattle) ... ', currentHp, hpToRemove, board.get(unitPos));
    console.log(hpToRemove);
    process.exit();
  }
  return {
    board: board.setIn([unitPos, 'hp'], newHp),
    unitDied: false
  };
};

module.exports = BattleController;
