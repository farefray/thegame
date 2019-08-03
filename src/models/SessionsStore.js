/**
 * Instance for storing active game sessions
 * Also includes helper methods
 *
 * @returns {SessionsStore}
 */
function SessionsStore() {
  this.storage = {};
  return this;
}

SessionsStore.prototype.store = function (session) {
  this.storage[session.get('ID')] = session;
};

SessionsStore.prototype.get = function (sessionID) {
  const session = this.storage[sessionID];
  return session || null;
};

SessionsStore.prototype.keys = function () {
  return Object.keys(this.storage);
};

SessionsStore.prototype.destroy = function (sessionID) {
  if (this.get(sessionID)) {
    delete this.storage[sessionID];
  }
};

/**
 * @param {String} sessionID
 * @param {Array} updateArray [field, value]
 */
SessionsStore.prototype.setIn = function (sessionID, updateArray) {
  const session = this.get(sessionID);
  if (session) {
    session.set(updateArray[0], updateArray[1]);
  }
};

module.exports = SessionsStore;
