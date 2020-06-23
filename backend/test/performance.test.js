/* global describe, it */
import Battle from '../src/structures/Battle.ts';
import MonsterService from '../src/services/Monsters';
import BattleUnitList from '../src/structures/Battle/BattleUnitList';
import BattleUnit from '../src/structures/BattleUnit';

const {
  performance
} = require('perf_hooks');

const should = require('should');

const monsterService = MonsterService.getInstance();

describe('Perf test', async () => {
  var t0 = performance.now();
  it('Full sized battle execution #50', async () => {
    const npcBoard = new BattleUnitList();

    // 50 runs for battle
    for (let runs = 0; runs < 10; runs++) {
      for (let x = 0; x < 8; x++) {
        const monster = monsterService.getRandomUnit();
        npcBoard.push(new BattleUnit({
          name: monster.name,
          x: x,
          y: 7
        }));
      }

      const playerBoard = new BattleUnitList();
      for (let x = 0; x < 8; x++) {
        const monster = monsterService.getRandomUnit();
        playerBoard.push(new BattleUnit({
          name: monster.name,
          x: x,
          y: 0
        }));
      }

      const battle = new Battle([{ units: playerBoard }, { units: npcBoard }]);
      const battleResult = await battle.proceedBattle();
      battleResult.should.be.ok();
      battleResult.actionStack.should.be.an.Array();
      battleResult.actionStack.length.should.be.above(0);
    }

    const duration = performance.now() - t0;
    console.log("Full sized battle execution took " + (duration) + " milliseconds.");
  });
});
