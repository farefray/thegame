import MutableObject from '../abstract/MutableObject';
import { BattleResult } from '../objects/Battle';

const sleep = require('util').promisify(setTimeout);
const { STATE } = require('../../../frontend/src/shared/constants.js');

function State(playersArray) {
  this.round = 1;
  this.incomeBase = 1;
  this.amountOfPlayers = playersArray.length;
  this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;

  const playersObject = {};
  playersArray.forEach(player => {
    playersObject[player.index] = player;
  });

  this.players = playersObject;
  return MutableObject.call(this);
}

State.prototype = Object.create(MutableObject.prototype);

/**
 * @function
 * @description Ending round. Time based event for all players after battle is over
 * Increase players exp by 1
 * Gold:
 *  Interest for 10 gold
 *  Increasing throughout the game basic income
 */
const MAX_ROUND_FOR_INCOME_INC = 5;
State.prototype.endRound = function(battleResult: BattleResult) {
  if (this.round <= MAX_ROUND_FOR_INCOME_INC) {
    this.incomeBase = this.incomeBase + 1;
  }

  this.round = this.round + 1;

  for (const uid in this.players) {
    const player = this.players[uid];
    const gold = player.get('gold');
    const bonusGold = Math.min(Math.floor(gold / 10), 5);
    const newGold = gold + this.incomeBase + bonusGold + streakGold;
    player.gold = newGold;
  }

  console.log("State.prototype.endRound -> battleResult", battleResult)

  // todo use battleResult for player data
};


State.prototype.dropPlayer = playerID => {
  for (const uid in this.players) {
    if (uid === playerID) {
      delete this.players[uid];
      this.amountOfPlayers -= 1;
    }
  }
};

/** Lifecycle methods */
State.prototype.roundEnd = async function(battleResult: BattleResult, countdown: number) {
  await sleep(countdown);
  this.endRound(battleResult);
  this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
};

State.prototype.scheduleNextRound = async function() {
  await sleep(this.countdown);
  return true;
};

export default State;
