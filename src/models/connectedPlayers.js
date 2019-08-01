/**
 * Instance for storing connected players and their sessions.
 * Also includes helper methods which are supposed to make easier data extracting and workout
 *
 * @returns {ConnectedPlayers}
 */
function ConnectedPlayers() {
  this.storage = {};
  return this;
}

ConnectedPlayers.prototype.get = function (socketID) {
  const session = this.storage[socketID];
  return session || null;
};

ConnectedPlayers.prototype.keys = function () {
  return Object.keys(this.storage);
};

ConnectedPlayers.prototype.set = function (socketID, customer) {
  this.storage[socketID] = customer;
  return this.storage[socketID];
};

ConnectedPlayers.prototype.updateReadyStatus = function () {
  let readyCustomers = 0;
  let notReadyCustomers = 0;
  Object.keys(this.storage).forEach((socketID) => {
    const customer = this.get(socketID);
    if (customer.isReady) {
      readyCustomers++;
    } else {
      notReadyCustomers++;
    }
  });

  return {
    allReady: readyCustomers === notReadyCustomers && readyCustomers > 0,
    totalCustomers: readyCustomers + notReadyCustomers
  };
};

module.exports = ConnectedPlayers;
