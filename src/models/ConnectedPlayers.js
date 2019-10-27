/**
 * Instance for storing connected players and their sessions.
 * Also includes helper methods which are supposed to make easier data extracting and workout
 * @todo its supposed to be connected customers instead...
 * @returns {ConnectedPlayers}
 */
function ConnectedPlayers() {
  this.storage = {};
  return this;
}

/**
 * @description returns {Customer} by `socketID`
 * @param socketID
 * @returns {Customer}
 */
ConnectedPlayers.prototype.get = function(socketID) {
  const customer = this.storage[socketID];
  return customer || null;
};

ConnectedPlayers.prototype.keys = function() {
  return Object.keys(this.storage);
};

ConnectedPlayers.prototype.set = function(socketID, customer) {
  this.storage[socketID] = customer;
  return this.storage[socketID];
};

ConnectedPlayers.prototype.disconnect = function(socketID) {
  if (this.get(socketID)) {
    delete this.storage[socketID];
  }
};

/**
 * @param {String} socketID
 * @param {Array} updateArray [field, value]
 */
ConnectedPlayers.prototype.setIn = function(socketID, updateArray) {
  const customer = this.get(socketID);
  if (customer) {
    customer.set(updateArray[0], updateArray[1]);
  }
};

/**
 * @param socketID
 * @returns {SessionID}
 */
ConnectedPlayers.prototype.getSessionID = function(socketID) {
  const customer = this.get(socketID);
  return customer && customer.get('sessionID');
};

module.exports = ConnectedPlayers;