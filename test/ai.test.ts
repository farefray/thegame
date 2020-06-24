import { suite, test, only, skip } from '@testdeck/mocha';
import { expect } from 'chai';

import Session from '../src/models/Session';
import AiPlayer from '../src/structures/AiPlayer';
import { BattleResult } from '../src/structures/Battle';
import MonsterService from '../src/services/Monsters';
import BattleUnit from '../src/structures/BattleUnit';

import { Container } from 'typedi';

const mockedEventEmitter = {
  emit: (...args) => {
    // console.info("mockedEventEmitter args", args)
  }
};

Container.set('event.emitter', mockedEventEmitter);

@suite
class AI {
  @test
  canInitializeGameWithAI() {
    const session = new Session([]);
    expect(session).to.be.a('object');
    expect(session).to.have.property('state');

    const gameState = session.getState();
    expect(gameState).to.be.a('object');
    expect(Object.keys(gameState.getPlayersArray()).length).to.be.equal(2);
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
    expect(state.getPlayersArray().length).to.be.equal(1);
  }
}


@suite
class Minor_AI_functionality {
  @test
  getPreferablePosition() {
    const playerOne = new AiPlayer('ai_1');
    playerOne.level = 10;
    const monsterService = MonsterService.getInstance();
    while(!playerOne.isBoardFull()) {
      const monsterInterface = monsterService.getRandomUnit();
      const unit = new BattleUnit({
        name: monsterInterface.name || 'dwarf',
        x: playerOne.availableHandPosition,
        y: -1,
        teamId: 0,
      });

      playerOne.hand.setCell(playerOne.availableHandPosition, 0, unit);

      const freeSpots = playerOne.board.freeSpots(); // todo make player.freeSpots and filter positions which are not in scope
      const prefereablePosition = unit.getPreferablePosition(freeSpots);
      playerOne.moveUnitBetweenPositions(unit.position, prefereablePosition);
    }
  }
}