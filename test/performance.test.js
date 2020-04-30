/* global describe, it */
import Battle from '../src/objects/Battle.ts';
import Monsters from '../src/utils/Monsters';

const {
  performance
} = require('perf_hooks');

const should = require('should');


describe('Perf test', async () => {
  var t0 = performance.now();
  it('Full sized battle execution #50', async (done) => {
    const npcBoard = [];

    // 50 runs for battle
    for (let runs = 0; runs < 10; runs++) {
      for (let x = 0; x < 8; x++) {
        const monster = Monsters.getRandomUnit();
        npcBoard.push({
          name: monster.name,
          x: x,
          y: 7
        });
      }

      const playerBoard = [];
      for (let x = 0; x < 8; x++) {
        const monster = Monsters.getRandomUnit();
        playerBoard.push({
          name: monster.name,
          x: x,
          y: 0
        });
      }

      const battle = new Battle({ units: playerBoard }, { units: npcBoard });
      battle.should.be.ok();
      battle.actionStack.should.be.an.Array();
      battle.actionStack.length.should.be.above(0);
    }

    const duration = performance.now() - t0;
    console.log("Full sized battle execution took " + (duration) + " milliseconds.");
    duration.should.be.below(2000);
    done();
  });
});
