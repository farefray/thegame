
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
  this.unitAmounts = {}; // ??

  return this;
}

Player.prototype.get = function (field) {
  switch (field) {
    case 'availableHandPosition': {
      const hand = this.get('hand');
      for (let i = 0; i < 8; i++) {
        if (hand[i] === undefined) {
          return String(i);
        }
      }

      return null;
    }
    default: {
      return this[field] !== undefined ? this[field] : null;
    }
  }
};

Player.prototype.set = function (field, value) {
  this[field] = value;
};


// not sure if we should carry such support functions with all the objects. Assuming it may affect performance...
Player.prototype.addToHand = function (unit) {
  const position = this.get('availableHandPosition');
  if (position !== null) {
    const hand = this.get('hand');
    hand[position] = unit;
    this.set('hand', hand);
    return position;
  }

  return null;
};

module.exports = Player;
