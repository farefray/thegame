

const BoardJS = require('./game/board');

const f = require('./f');

const rarityAmount = [45, 30, 25, 15, 10]; // Real version
// const rarityAmount = [3, 3, 3, 3, 3]); // Test version
// const rarityAmount = [9, 9, 9, 9, 9]); // Test version

exports.debugMode = true;

const levelPieceProbability = {
  1: {
    1: 1.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 0.00,
  },
  2: {
    1: 0.70, 2: 0.30, 3: 0.00, 4: 0.00, 5: 0.00,
  },
  3: {
    1: 0.60, 2: 0.35, 3: 0.05, 4: 0.00, 5: 0.00,
  },
  4: {
    1: 0.50, 2: 0.35, 3: 0.15, 4: 0.00, 5: 0.00,
  },
  5: {
    1: 0.40, 2: 0.35, 3: 0.23, 4: 0.02, 5: 0.00,
  },
  6: {
    1: 0.33, 2: 0.30, 3: 0.30, 4: 0.07, 5: 0.00,
  },
  7: {
    1: 0.30, 2: 0.30, 3: 0.30, 4: 0.10, 5: 0.00,
  },
  8: {
    1: 0.24, 2: 0.30, 3: 0.30, 4: 0.15, 5: 0.01,
  },
  9: {
    1: 0.22, 2: 0.30, 3: 0.25, 4: 0.20, 5: 0.03,
  },
  10: {
    1: 0.19, 2: 0.25, 3: 0.25, 4: 0.25, 5: 0.06,
  },
};

// TODO: Correct numbers
const expRequiredPerLevel = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  6: 16,
  7: 24,
  8: 32,
  9: 40,
};

exports.getExpRequired = index => expRequiredPerLevel[String(index)];

const damageFactorType = {
  attack: 0.125,
  spell: 0.5,
};

exports.getDamageFactorType = actionType => damageFactorType[actionType];

/**
 * Set level setups
 * 1,2,3 Npc levels
 */
const roundSetConfiguration = {
  1: async () => BoardJS.createBattleBoard([
    { name: 'dwarf', x: 0, y: 8 },
  ]),
  2: async () => BoardJS.createBattleBoard([
    { name: 'dwarf', x: 3, y: 6 },
    { name: 'dwarf', x: 6, y: 8 },
  ]),
  3: async () => BoardJS.createBattleBoard([
    { name: 'dwarf', x: 3, y: 6 },
    { name: 'dwarf', x: 6, y: 8 },
    { name: 'dwarf', x: 1, y: 8 },
  ])
};

const playerTestingBoards = {
  1: async () => BoardJS.createBattleBoard([
    { name: 'minotaur', x: 6, y: 5 },
  ])
};

exports.getTestingPlayerBoard = async (boardID) => {
  const board = await playerTestingBoards[boardID]();
  return board;
};

exports.getSetRound = async (round) => {
  const board = await roundSetConfiguration[String(round)]();
  return board;
};

const gymLeader = {
  10: 'Brock'
};

exports.getGymLeader = round => gymLeader[String(round)];


exports.getRoundType = (round) => {
  if (round <= 3) {
    return 'npc';
  }
  if (round % 5 === 0 && round > 5 && round < 50) {
    return 'gym';
  }
  if (round === 21 || round === 31 || round === 41 || round === 51) {
    return 'shop';
  }
  return 'pvp';
};

// index - 1, Handles 0-4 indexes, send cost directly
exports.getRarityAmount = index => rarityAmount[index - 1];

exports.getLevelPieceProbability = index => levelPieceProbability[String(index)];

exports.getPieceProbabilityNum = (index) => {
  const probs = levelPieceProbability[String(index)];
  if (f.isUndefined(probs)) console.log('getPieceProbability', index);
  return [probs['1'], probs['1'] + probs['2'], probs['1'] + probs['2'] + probs['3'],
    probs['1'] + probs['2'] + probs['3'] + probs['4'],
    probs['1'] + probs['2'] + probs['3'] + probs['4'] + probs['5']];
};

exports.getTypeEffectString = (typeFactor) => {
  if (typeFactor <= 0.0) {
    return 'No effect';
  } if (typeFactor <= 0.25) {
    return 'Not effective';
  } if (typeFactor <= 0.5) {
    return 'Not very effective';
  } if (typeFactor > 0.5 && typeFactor < 2) {
    return '';
  } if (typeFactor <= 2) {
    return 'Super effective!';
  } if (typeFactor <= 4) {
    return 'Extremely effective!';
  }
  return '';
};
