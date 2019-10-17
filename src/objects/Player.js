import Position from '../../app/src/objects/Position';
import BattleUnit from './BattleUnit';

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
  this.board = {}; // todo keep it simple {x,y,name}
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
    hand[position] = new BattleUnit(unit, new Position(position), 0);
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

export default Player;
