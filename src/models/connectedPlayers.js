const Keyv = require('keyv');

/**
 * Instance for storing connected players and their sessions.
 * Also includes helper methods which are supposed to make easier data extracting and workout
 *
 * @returns {ConnectedPlayers}
 */
function ConnectedPlayers() {
  this.storage = new Keyv();
  this.storage.on('error', err => console.log('Keyv connection Error', err));
  return this;
}

ConnectedPlayers.prototype.getSession = async function (sessID) {
  const session = await this.storage.get(sessID);
  return session;
};

ConnectedPlayers.prototype.set = async function (sessID, customer) {
  await this.storage.set(sessID, customer);
  return true;
};

ConnectedPlayers.prototype.setIn = async function
module.exports = ConnectedPlayers;
