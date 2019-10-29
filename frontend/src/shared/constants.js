module.exports = {
  DIRECTION: {
    SOUTH: 1,
    WEST: 2,
    NORTH: 3,
    EAST: 4
  },
  TEAM: {
    NONE: -1,
    A: 0,
    B: 1
  },
  ACTION: {
    INIT: 'init',
    MOVE: 'move',
    ATTACK: 'attack',
    CAST: 'cast',
    HEALTH_CHANGE: 'healthchange',
    REGENERATION: 'regen'
  },
  STATE: {
    COUNTDOWN_BETWEEN_ROUNDS: 15 * 1000
  }
};
