function Customer(socketID) {
  this.socketID = socketID;
  this.isLoggedIn = false;

  this.sessionID = null; // session after game start
}

Customer.prototype.get = function(field) {
  return this[field] || null;
};

Customer.prototype.set = function(field, value) {
  this[field] = value;
};

module.exports = Customer;
