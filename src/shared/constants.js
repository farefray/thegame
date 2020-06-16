module.exports = {
  DIRECTION: {
    SOUTH: 1,
    WEST: 2,
    NORTH: 3,
    EAST: 4
  },
  TEAM: {
    NONE: '-1',
    A: 0,
    B: 1
  },
  ACTION: { /** TODO Make this enum, to save size? */
    INIT: 'init',
    MOVE: 'move',
    ATTACK: 'attack',
    CAST: 'cast',
    HEALTH_CHANGE: 'healthchange',
    MANA_CHANGE: 'manachange',
    SPAWN: 'spawn',
    REGENERATION: 'regen',
    DEATH: 'death',
    EFFECT: 'effect'
  },
  STATE: {
    FIRST_ROUND_COUNTDOWN: 15 * 1000, // todo make it work differently from countdown between rounds
    COUNTDOWN_BETWEEN_ROUNDS: 15 * 1000
  }
};
