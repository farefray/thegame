
function Player(id) {
  this.index = id;
  this.hp = 100;
  this.level = 1;
  this.exp = 0;
  this.expToReach = 1; // ?
  this.gold = 1;
  this.shop = {};
  this.hand = {};
  this.board = {};
  this.rivals = {}; // ?

  return this;
}

Player.prototype.get = function (field) {
  return this[field] || null;
};

Player.prototype.set = function (field, value) {
  this[field] = value;
};


module.exports = Player;
