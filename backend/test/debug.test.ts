// @ts-nocheck
import { suite, test, only } from '@testdeck/mocha';
import { expect } from 'chai';

import Battle from '../src/structures/Battle';
import BattleUnit from '../src/structures/BattleUnit';
import BattleUnitList from '../src/structures/Battle/BattleUnitList';

@suite
class Debug {
  @test
  async debugCase() {
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
  }
}