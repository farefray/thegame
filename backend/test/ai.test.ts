import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';

import Session from '../src/objects/Session';

let gameState;
let session: Session;

@suite
class AI {
  @test
  canInitializeGameWithAI() {
    session = new Session([]);
    expect(session).to.be.an.Object();
    expect(session).to.have.property('state');

    gameState = session.getState();
    expect(gameState).to.be.an.Object();
    expect(Object.keys(gameState.players).length).to.be.equal(2);
  }
}

/*

describe('Core Modules', () => {


  it('Can initialize game with AI only', async () => {

  });

  it('AI can proceed into rounds', async () => {
    for (let round = 0; round < 1; round++) {
      const roundResults = await session.nextRound();
      const { battles } = roundResults;
      console.log("battles", battles)
    }
  });
});
*/
