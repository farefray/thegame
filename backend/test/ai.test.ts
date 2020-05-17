import { suite, test, only } from '@testdeck/mocha';
import { expect } from 'chai';

import Session from '../src/objects/Session';
import AiPlayer from '../src/objects/AiPlayer';
import { BattleResult } from '../src/objects/Battle';
import monsterUtils from '../src/utils/monsterUtils';
import BattleUnit from '../src/objects/BattleUnit';

@suite
class AI {
  @test
  canInitializeGameWithAI() {
    const session = new Session([]);
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
    expect((playerOne.board.units()).size).to.be.above(0);
  }

  @test
  async canProcessAIBattle() {
    const session = new Session([]);
    while (session.hasNextRound()) {
      const roundResults = await session.nextRound();
      const { battles } = roundResults;

      // make sure AI has units
      expect(battles.length).to.be.above(0);
      const firstBattle:BattleResult|undefined = battles.shift();
      expect(firstBattle).to.be.a('object');
      expect(firstBattle).to.be.not.a('undefined');

      if (firstBattle?.startBoard) {
        expect(Object.keys(firstBattle.startBoard)).to.be.a('array');
        expect(Object.keys(firstBattle.startBoard).length).to.be.above(0);
      } else {
        throw Error('No board was made');
      }

      expect(firstBattle.actionStack.length).to.be.above(0);
    }

    const state = session.getState();
    expect(state.getPlayers().length).to.be.equal(1);
  }
}


@suite
class Minor_AI_functionality {
  @test
  getPreferablePosition() {
    const playerOne = new AiPlayer('ai_1');
    playerOne.level = 10;
    while(!playerOne.isBoardFull()) {
      const monsterInterface = monsterUtils.getInstance().getRandomUnit();
      const unit = new BattleUnit({
        name: monsterInterface.name || 'dwarf',
        x: playerOne.availableHandPosition,
        y: -1,
        teamId: 0,
      });

      playerOne.hand.setCell(playerOne.availableHandPosition, 0, unit);

      const freeSpots = playerOne.board.freeSpots(); // todo make player.freeSpots and filter positions which are not in scope
      const prefereablePosition = unit.getPreferablePosition(freeSpots);
      playerOne.movePawn(unit.stringifiedPosition, prefereablePosition);
    }
  }
}