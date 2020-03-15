/* global describe, it */
import createBattleBoard from '../src/utils/createBattleBoard.ts';
import BattleController from '../src/controllers/BattleController';

import Position from '../../frontend/src/shared/Position';

const should = require('should');
const rewire = require('rewire');

describe.only('Battle logic tests', () => {
  it('Closest target being selected', async () => {
    const battleBoard = createBattleBoard(
      {
        owner: 'first_player',
        units: [
          {
            name: 'dwarf',
            x: 0,
            y: 3
          },
          {
            name: 'dwarf',
            x: 2,
            y: 3
          },
          {
            name: 'dwarf',
            x: 4,
            y: 3
          },
          {
            name: 'dwarf',
            x: 6,
            y: 3
          },
          {
            name: 'dwarf',
            x: 7,
            y: 3
          }
        ]
      },
      {
        owner: 'second_player',
        units: [
          {
            name: 'minotaur',
            x: 0,
            y: 4
          },
          {
            name: 'minotaur',
            x: 1,
            y: 4
          },
          {
            name: 'minotaur',
            x: 3,
            y: 4
          },
          {
            name: 'minotaur',
            x: 5,
            y: 4
          },
          {
            name: 'minotaur',
            x: 6,
            y: 4
          }
        ]
      }
    );
    
    const battleResult = await BattleController.setupBattle(battleBoard);  // assuming all units are melee
    battleResult.should.be.ok();

    // supposed that first action in such case will be melee attack, not a move
    const unitsCount = 10;
    const firstActions = battleResult.actionStack.splice(unitsCount, unitsCount); // first are spawn items
    firstActions.forEach((action) => {
      action.type.should.be.equal('attack');

      let { from, to } = action.payload;
      from = new Position(from);
      to = new Position(to);

      const distanceToTarget = Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
      distanceToTarget.should.be.equal(1);
    })
  });
});
