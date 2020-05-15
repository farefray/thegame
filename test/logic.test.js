/* global describe, it */

import Position from '../../frontend/src/shared/Position';
import Battle from '../src/objects/Battle';

const should = require('should');

describe('Battle logic tests', () => {
  it('Can handle battle and closest target being selected', async () => {

    const battle = new Battle([{
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
      }]);

    const battleResult = await battle.proceedBattle();  // assuming all units are melee
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

  it('Can handle battle with neutral "stone" unit', async () => {
    const battle = new Battle([
      {
        owner: 'first_player',
        units: [
          {
            name: 'dwarf',
            x: 4,
            y: 3
          }
        ]
      },
      {
        owner: 'second_player',
        units: [
          {
            name: 'minotaur',
            x: 4,
            y: 5
          }
        ]
      },
      {
        units: [
          {
            name: 'stone',
            x: 4,
            y: 4
          }
        ]
      }
    ]);

    const battleResult = await battle.proceedBattle();
    battleResult.should.be.ok();
    battleResult.actionStack.should.be.an.Array();
    battleResult.actionStack.length.should.be.above(0);
    battleResult.actionStack.length.should.be.below(40);

    // we should detect that no moves was done into stone
    const moveActions = battleResult.actionStack.filter((a) => a.type === 'move');
    moveActions.length.should.be.equal(3);
    moveActions.forEach((action) => {
      action.type.should.be.equal('move');
      action.payload.to.should.not.deepEqual({
        x: 4,
        y: 4
      });
    })
  });

  it('Can handle battle with neutral "target" unit', async () => {
    const battle = new Battle([
      {
        owner: 'first_player',
        units: [
          {
            name: 'dwarf',
            x: 4,
            y: 3
          }
        ]
      },
      {
        owner: 'second_player',
        units: [
          {
            name: 'minotaur',
            x: 4,
            y: 5
          }
        ]
      },
      {
        units: [
          {
            name: 'target_melee',
            x: 4,
            y: 4
          }
        ]
      }
    ]);
    
    const battleResult = await battle.proceedBattle();

    battleResult.should.be.ok();
    battleResult.actionStack.should.be.an.Array();
    battleResult.actionStack.length.should.be.above(0);
    battleResult.actionStack.length.should.be.below(100);

    // we should detect that no moves was done into stone
    const attackActions = battleResult.actionStack.filter((a) => a.type === 'attack').splice(2, 2);
    attackActions.forEach((action) => {
      action.type.should.be.equal('attack');

      // checking that first actions will be into target unit
      let { to } = action.payload;
      (to.x).should.be.equal(4);
      (to.y).should.be.equal(4);
    })
  });
});
