import { suite, test, only } from '@testdeck/mocha';
import { expect } from 'chai';

import Session from '../src/objects/Session';
import AiPlayer from '../src/objects/AiPlayer';
import Battle, { BattleResult } from '../src/objects/Battle';
import Monsters from '../src/utils/monsters';
import BattleUnit from '../src/objects/BattleUnit';
import BattleUnitList from '../src/objects/BattleUnit/BattleUnitList';

@suite
class Debug {
  @test
  async debugCase(done) {
    const npcBoard = new BattleUnitList([
      new BattleUnit({
        name: 'dwarf_geomancer',
        x: 0,
        y: 7,
        teamId: 1
      })
    ]);
    const playerBoard = new BattleUnitList([
      new BattleUnit({
        name: 'dwarf_geomancer',
        x: 0,
        y: 0,
        teamId: 0
      })
    ]);

    const battle = new Battle([{ units: playerBoard, owner: 'player_1' }, { units: npcBoard, owner: 'player_2' }]);
    const battleResult = await battle.proceedBattle();
    expect(battleResult).to.be.a('object');
    expect(battleResult.actionStack.length).to.be.above(0);
    done()
  }
}