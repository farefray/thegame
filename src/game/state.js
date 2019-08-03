const {
  Map,
  List,
} = require('immutable');
const f = require('../f');
const gameConstantsJS = require('../game_constants');
const pawns = require('../pawns');

const StateJS = {};

/** Private methods */

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
    return Map({
      state: await StateJS.endTurn(newState),
      last: true
    });
  }
  return Map({
    state,
    last: false
  });
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

StateJS.increaseExp = (stateParam, playerIndex, amountParam) => {
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
};


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
StateJS.endTurn = async (stateParam) => {
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
      // state = await ShopJS.refreshShop(state, index);
      // TODO update shops
      // console.log('Not locked for player[' + i + '] \n', state.get('pieces').get(0));
    }
    state = await StateJS.increaseExp(state, index, 1);
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
};

StateJS.endBattleForAll = async (stateParam, winners, finalBoards, matchups, roundType) => {
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

module.exports = StateJS;
