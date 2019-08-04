const uuidv1 = require('uuid/v1');

const START_COUNTER_VALUE = 0; // 0, 1 is for testing alone


function Session(clients, state) {
  this.ID = uuidv1();
  this.state = state;
  this.customers = clients; // was connectedPlayers, so handle this in case
  // also there as session.pieces, but i see no point cuz state is here(state.pieces)

  this.counter = START_COUNTER_VALUE; //??
  this.discardedPieces = [];
  this.players = {}; //??
  this.messages = []; //?
  return this;
}

Session.prototype.get = function (field) {
  return this[field] || null;
};

Session.prototype.set = function (field, value) {
  this[field] = value;
};

module.exports = Session;
