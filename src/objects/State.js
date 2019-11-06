import MutableObject from '../abstract/MutableObject';

const sleep = require('util').promisify(setTimeout);
const { STATE } = require('../../../frontend/src/shared/constants');

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
 *  Win streak / lose streak
 */
const MAX_ROUND_FOR_INCOME_INC = 5;
State.prototype.endRound = function() {
  if (this.round <= MAX_ROUND_FOR_INCOME_INC) {
    this.incomeBase = this.incomeBase + 1;
  }

  this.round = this.round + 1;

  for (const uid in this.players) {
    const player = this.players[uid];
    const gold = player.get('gold');
    const bonusGold = Math.min(Math.floor(gold / 10), 5);
    const streak = player.streak || 0;
    const streakGold = Math.min(Math.floor(streak === 0 || Math.abs(streak) === 1 ? 0 : Math.abs(streak) / 5 + 1), 3);
    const newGold = gold + this.incomeBase + bonusGold + streakGold;
    player.set('gold', newGold);
  }
};

/**
 * @param {Object} battles Battle results for all the players in state
 */
State.prototype.damagePlayers = function(battles) {
  for (const uid in this.players) {
    const battleResult = battles[uid];

    // actually now there will be always damage, need to finish :D
    if (battleResult.playerDamage) {
      const player = this.players[uid];
      const newHP = player.get('health') - battleResult.playerDamage;
      player.set('health', newHP);

      if (newHP <= 0) {
        // todo loss
      }
    }
  }
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
State.prototype.scheduleRoundStart = async function () {
  await sleep(this.countdown);
  return true;
};

State.prototype.scheduleRoundEnd = async function (battleRoundResult) {
  await sleep(battleRoundResult.battleTime);
  this.endRound();
  this.damagePlayers(battleRoundResult.battles);
  this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
};

State.prototype.scheduleNextRound = async function () {
  await sleep(this.countdown);
  return true;
};

export default State;
