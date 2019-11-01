/* global describe, it */
import Battle from '../src/objects/Battle';
import createBattleBoard from '../src/utils/createBattleBoard';
import Monsters from '../src/utils/Monsters';

const should = require('should');
const rewire = require('rewire');

const benchtest = require("benchtest");
benchtest(null, {
  minCycles: 10,
  maxCycles: 100,
  sensitivity: .01,
  log: "json",
  logStream: console,
  all: true,
  off: false,
  only: false
});
beforeEach(benchtest.test);
after(benchtest.report);


let perf = typeof (performance) !== "undefined" ? performance : null;
if (typeof (module) !== "undefined" && typeof (window) === "undefined") {
  perf = {
    now: require("performance-now"),
    memory: {}
  }
  Object.defineProperty(perf.memory, "usedJSHeapSize", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 0
  });
}

[1].forEach(num => {
  describe("Test Suite " + num, function () {
    it("Full sized battle execution #", function test(done) {
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

      const combinedBoard = createBattleBoard(playerBoard, npcBoard);
      const battle = new Battle(combinedBoard);
      battle.should.be.ok();
      battle.actionStack.should.be.an.Array();
      battle.actionStack.length.should.be.above(0);

      (this.performance.duration).should.be.below(75);
      done();
    });
  });
});