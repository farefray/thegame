import React from 'react';
import ActiveGame from '../ActiveGame';
import BattleUnitList from '@/../../backend/src/objects/BattleUnit/BattleUnitList';
import BattleUnit from '@/../../backend/src/objects/BattleUnit';

const defaultBoard = [{
  owner: 'first_player',
  units: new BattleUnitList([
    new BattleUnit({
      name: 'dwarf_geomancer',
      x: 5,
      y: 0
    })
  ])
},
{
  owner: 'second_player',
  units: new BattleUnitList([
    new BattleUnit({
      name: 'minotaur_mage',
      x: 5,
      y: 7
    }),
    new BattleUnit({
      name: 'stone',
      x: 5,
      y: 6
    })
  ])
}];



export default <ActiveGame props={defaultBoard} />;
