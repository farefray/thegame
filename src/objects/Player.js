const BoardJS = require('../controllers/board'); // todo get rid of this dependency here
const DEBUG = true; // SORRY

function Player(id) {
  this.index = id;
  this.hp = 100;
  this.level = DEBUG ? 5 : 1;
  this.exp = 0;
  this.expToReach = 1; // ?
  this.gold = 1;
  this.shopUnits = {};
  this.hand = {};
  this.board = {};
  this.rivals = {}; // ?
  this.unitAmounts = {}; // ??

  return this;
}

Player.prototype.get = function(field) {
  switch (field) {
    case 'availableHandPosition': {
      const hand = this.get('hand');
      for (let i = 0; i < 8; i++) {
        if (hand[i] === undefined) {
          return `${String(i)},-1`;
        }
      }

      return null;
    }
    default: {
      return this[field] !== undefined ? this[field] : null;
    }
  }
};

Player.prototype.set = function(field, value) {
  this[field] = value;
};

// not sure if we should carry such support functions with all the objects. Assuming it may affect performance...

Player.prototype.addToHand = async function(unit) {
  const position = this.get('availableHandPosition');
  if (position !== null) {
    const hand = this.get('hand');
    hand[position] = await BoardJS.createBattleUnit(unit, position, 0);
    this.set('hand', hand);
    return position;
  }

  return null;
};

Player.prototype.increaseExperience = function() {
  // TODO
};

Player.prototype.isDead = function() {
  return this.hp <= 0;
};

module.exports = Player;
