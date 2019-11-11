import Position from '../../../frontend/src/shared/Position';
import BattleUnit from './BattleUnit';
import Monsters from '../utils/Monsters';

function Player(id) {
  this.index = id;
  this.health = 100;
  this.mana = 0;
  this.level = 1;
  this.exp = 0;
  this.expToReach = 1; // ?
  this.gold = 2;
  this.shopUnits = {};
  this.hand = {};
  this.board = {};
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
Player.prototype.addToHand = async function (unitName) {
  const availableHandPosition = this.get('availableHandPosition');
  if (availableHandPosition !== null) {
    const hand = this.get('hand');
    const pos = new Position(availableHandPosition);
    hand[availableHandPosition] = new BattleUnit(Monsters.getMonsterStats(unitName), pos, 0);

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