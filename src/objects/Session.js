const uuidv1 = require('uuid/v1');

function Session(clients, state) {
  this.ID = uuidv1();
  this.state = state;
  this.clients = clients; // was connectedPlayers, so handle this in case
  // also there as session.pieces, but i see no point cuz state is here(state.pieces)

  this.discardedPieces = [];
  this.players = {}; // ??
  return this;
}

Session.prototype.get = function(field) {
  return this[field] || null;
};

Session.prototype.set = function(field, value) {
  this[field] = value;
};

Session.prototype.disconnect = function(socketID) {
  if (this.clients.includes(socketID)) {
    this.clients = this.clients.filter(index => index !== socketID);
  }
};

Session.prototype.hasClients = function() {
  return this.clients.length > 0;
};

Session.prototype.getPlayerName = function(socketID) {
  return `Player ${socketID}`; // TODO
};

module.exports = Session;
