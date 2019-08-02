
function State(playersArray, deck) {
  this.discardedPieces = [];
  this.round = 1;
  this.income_basic = 1;
  this.amountOfPlayers = playersArray.length;
  this.players = playersArray;
  this.pieces = deck;

  return this;
}

State.prototype.get = function (field) {
  return this[field] || null;
};

State.prototype.set = function (field, value) {
  this[field] = value;
};

// bad
State.prototype.getIn = function ([what, index, param]) {
  if (param) {
    return this.get(what)[index][param];
  }

  return this.get(what)[index];
}

module.exports = State;
