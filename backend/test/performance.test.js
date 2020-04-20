/* global describe, it */
import Battle from '../src/objects/Battle.ts';
import Monsters from '../src/utils/Monsters';

const should = require('should');
const rewire = require('rewire');

let perf = typeof performance !== 'undefined' ? performance : null;
if (typeof module !== 'undefined' && typeof window === 'undefined') {
  perf = {
    now: require('performance-now'),
    memory: {}
  };
  Object.defineProperty(perf.memory, 'usedJSHeapSize', {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 0
  });
}

describe('Perf test', async () => {
  it('Full sized battle execution #', async (done) => {
    const npcBoard = [];

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

    this.performance.duration.should.be.below(10);
    console.log("test -> this.performance.duration", this.performance.duration)
    done();
  });
});
