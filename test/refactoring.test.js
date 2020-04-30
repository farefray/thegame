/* global describe, it */
import Battle from '../src/objects/Battle.ts';

const should = require('should');

describe('Refactoring testsuite', async function() {
  let runTicks = true;
  const tick = async () => {
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // console.log('tick');
    await sleep(1);

    if (runTicks) {
      tick()
    }
  }

  tick();

  const npcBoard = [{
    name: 'dwarf',
    x: 0,
    y: 3
  }];

  const playerBoard = [{
    name: 'minotaur_guard',
    x: 1,
    y: 4
  }];


  it('Single battle can be run', async (done) => {
    this.timeout(2);

    const battle = new Battle({ units: playerBoard }, { units: npcBoard });
    battle.should.be.ok();
    battle.actionStack.should.be.an.Array();
    battle.actionStack.length.should.be.above(0);

    runTicks = false;
    console.log('no tick')
    done();
  });
});
