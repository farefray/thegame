import MutableObject from '../abstract/MutableObject';

function State(playersArray, deck) {
  this.discardedPieces = [];
  this.round = 1;
  this.incomeBase = 1;
  this.amountOfPlayers = playersArray.length;

  const playersObject = {};
  playersArray.forEach(player => {
    playersObject[player.index] = player;
  });

  this.players = playersObject;
  this.pieces = deck;

  return MutableObject.call(this);
}

State.prototype = Object.create(MutableObject.prototype);

/**
 * @description prepares state for sending via socket. Removing all unnessesary data
 * @TODO
 */
State.prototype.prepareForSending = function() {
  this.delete('pieces');
};


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
    // TODO update shop
    // state = await ShopJS.refreshShop(state, index);

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
      const newHP = player.get('hp') - battleResult.playerDamage;
      player.set('hp', newHP);

      if (newHP <= 0) {
        this.amountOfPlayers = this.amountOfPlayers - 1;
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

module.exports = State;
