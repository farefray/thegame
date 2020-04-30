/* global describe, it */
import State from '../src/objects/State';

const should = require('should');
const rewire = require('rewire');

describe('Core Modules', () => {
  let gameState = null;

  it('Can initialize game with AI only', async () => {
    gameState = new State([]);
    gameState.should.be.an.Object();
    gameState.should.have.property('players');
    Object.keys(gameState.players).length.should.be.equal(2);
  });

  it('AI can proceed into rounds', async () => {
    for (let round = 0; round < 1; round++) {

    }
  });
});
