function Customer(socketID) {
  this.socketID = socketID;
  this.isReady = false; // start screen ready
  this.sessionID = null; // session after game start
}

Customer.prototype.get = function (field) {
  return this[field] || null;
};

module.exports = Customer;
