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

module.exports = StateJS;
