
function State(playersArray, deck) {
  this.discardedPieces = [];
  this.round = 1;
  this.incomeBase = 1;
  this.amountOfPlayers = playersArray.length;

  const playersObject = {};
  playersArray.forEach((player) => {
    playersObject[player.index] = player;
  });

  this.players = playersObject;
  this.pieces = deck;

  return this;
}

State.prototype.get = function (field) {
  return this[field] || null;
};

State.prototype.set = function (field, value) {
  this[field] = value;
};

State.prototype.delete = function (field) {
  if (this.get(field)) {
    delete this[field];
  }
};

State.prototype.prepareForSending = function () {
  this.delete('pieces');
  this.delete('discardedPieces');
};

// bad [todo get rid of setIn getIn methods, they are present only cuz of compatibility with immutable]
// UPD seems we cannot remove them, as I'm already getting used to their usage. Need optimize then :)
/**
 * @param {Array[firstIndex, secondIndex, thirdIndex]}
 * @returns {Any} this[firstIndex][secondIndex][thirdIndex]
 */
State.prototype.getIn = function ([what, index, param]) {
  if (param) {
    return this.get(what)[index][param];
  }

  return this.get(what)[index];
};

State.prototype.setIn = function ([what, where, which], value) {
  const whatToModify = this.get(what);
  if (which) {
    whatToModify[where][which] = value;
  } else {
    whatToModify[where] = value;
  }

  this.set(what, whatToModify);
};

/**
 * @function
 * @description Ending round. Time based event for all players after battle is over
 * Increase players exp by 1
 * Refresh shop as long as player is not locked
 * Gold:
 *  Interest for 10 gold
 *  Increasing throughout the game basic income
 *  Win streak / lose streak
 */
const MAX_ROUND_FOR_INCOME_INC = 5;
State.prototype.endRound = () => {
  if (this.round <= MAX_ROUND_FOR_INCOME_INC) {
    this.incomeBase = this.incomeBase + 1;
  }

  this.round = this.round + 1;

  for (const uid in this.players) {
    const player = this.players[uid];
    if (!player.get('locked')) {
      // TODO update shop
      // state = await ShopJS.refreshShop(state, index);
    }

    const gold = player.get('gold');
    const bonusGold = Math.min(Math.floor(gold / 10), 5);
    const streak = player.streak || 0;
    const streakGold = Math.min(Math.floor(
      (streak === 0 || Math.abs(streak) === 1 ? 0 : (Math.abs(streak) / 5) + 1),
    ), 3);
    const newGold = gold + this.incomeBase + bonusGold + streakGold;
    player.set('gold', newGold);
  }
};

module.exports = State;
