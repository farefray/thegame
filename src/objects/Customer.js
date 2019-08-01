function Customer(socketID) {
  this.socketID = socketID;
  this.sessionId = false; // Used for ready and sessionId (true|false|sessionId) [todo check this]
}

module.exports = Customer;
