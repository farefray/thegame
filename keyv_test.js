const Keyv = require('keyv');

function ConnectedPlayers() {
  this.storage = new Keyv();
  this.storage.on('error', err => console.log('Keyv connection Error', err));
  return this;
}

ConnectedPlayers.prototype.getSession = async function(sessID) {
  const session = await this.storage.get(sessID);
  return session;
};

ConnectedPlayers.prototype.setSession = async function(sessID, customer) {
  await this.storage.set(sessID, customer);
  return true;
};

// Init connected players models\
var storage = new ConnectedPlayers();

storage.setSession('test', { a: 1});

var testf = async () => {
  const sess = await storage.getSession('test');
  sess
}

testf()