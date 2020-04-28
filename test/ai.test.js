/* global describe, it */
import GameController from '../src/controllers/GameController';

const should = require('should');
const rewire = require('rewire');

describe('Core Modules', () => {
  let gameState = null;

  it('Can initialize game with AI only', async () => {
    gameState = await GameController.initializeState([], 2);
    gameState.should.be.an.Object();
    gameState.should.have.property('players');
    Object.keys(gameState.players).length.should.be.equal(2);
  });

  it('AI can proceed into rounds', async () => {
    for (let round = 0; round < 1; round++) {

    }
  });
});
