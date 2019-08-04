
function State(playersArray, deck) {
  this.discardedPieces = [];
  this.round = 1;
  this.income_basic = 1;
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

module.exports = State;
