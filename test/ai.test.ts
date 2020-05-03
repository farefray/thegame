import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';

import Session from '../src/objects/Session';
import AiPlayer from '../src/objects/AiPlayer';

@suite
class AI {
  private session: Session;

  constructor() {
    this.session = new Session([]);
  }

  @test
  canInitializeGameWithAI() {
    const session = this.session;
    expect(session).to.be.a('object');
    expect(session).to.have.property('state');

    const gameState = session.getState();
    expect(gameState).to.be.a('object');
    expect(Object.keys(gameState.players).length).to.be.equal(2);
  }

  @test
  willPurchaseAndPlaceMob() {
    const playerOne = new AiPlayer('ai_1');
    const playerTwo = new AiPlayer('ai_2');

    playerOne.beforeBattle(playerTwo);
    expect(playerOne.board).to.be.a('object');
    expect(Object.keys(playerOne.board).length).to.be.above(0);

    playerTwo.beforeBattle(playerOne);
    expect(playerTwo.board).to.be.a('object');
    expect(Object.keys(playerTwo.board).length).to.be.above(0);
  }

  @test
  async canProceedIntoAIRounds() {
    for (let round = 0; round < 1; round++) {
      const roundResults = await this.session.nextRound();
      const { battles } = roundResults;

      // make sure AI has units
      const firstBattle = battles.shift();
      expect(firstBattle).to.be.a('object');
      expect(firstBattle).to.be.not.a('undefined');

      if (firstBattle?.startBoard) {
        expect(Object.keys(firstBattle.startBoard)).to.be.a('array');
        expect(Object.keys(firstBattle.startBoard).length).to.be.above(0);
      }
    }
  }
}
