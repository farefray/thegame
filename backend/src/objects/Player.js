import Position from '../../../frontend/src/shared/Position';

const DEBUG = true; // SORRY

function Player(id) {
  this.index = id;
  this.health = 100;
  this.mana = 0;
  this.level = DEBUG ? 5 : 1;
  this.exp = 0;
  this.expToReach = 1; // ?
  this.gold = 1;
  this.shopUnits = {};
  this.hand = {};
  this.board = {}; // todo keep it simple {x,y,name}
  return this;
}

Player.prototype.get = function (field) {
  switch (field) {
    case 'availableHandPosition': {
      const hand = this.get('hand');
      for (let i = 0; i < 8; i++) {
        const pos = `${String(i)},-1`;
        if (hand[pos] === undefined) {
          return pos;
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
Player.prototype.addToHand = async function (unit) {
  const availableHandPosition = this.get('availableHandPosition');
  if (availableHandPosition !== null) {
    const hand = this.get('hand');
    const pos = new Position(availableHandPosition);
    hand[availableHandPosition] = {
      ...unit,
      x: pos.x,
      y: pos.y
    };

    this.set('hand', hand);
    return availableHandPosition;
  }

  return null;
};

Player.prototype.increaseExperience = function () {
  // TODO
};

Player.prototype.isDead = function () {
  return this.health <= 0;
};

export default Player;