import React from 'react';
import ActiveGame from '../ActiveGame';
import BattleUnitList from '@/../../backend/src/structures/Battle/BattleUnitList';
import BattleUnit from '@/../../backend/src/structures/BattleUnit';

const defaultBoard = [{
  owner: 'first_player',
  units: new BattleUnitList([
    new BattleUnit({
      name: 'minotaur',
      x: 5,
      y: 0
    })
  ])
},
{
  owner: 'second_player',
  units: new BattleUnitList([
    new BattleUnit({
      name: 'dwarf',
      x: 4,
      y: 7
    }),
    new BattleUnit({
      name: 'dwarf',
      x: 6,
      y: 7
    })
  ])
},
{
  owner: 'neutral_player',
  units: new BattleUnitList([
    new BattleUnit({
      name: 'stone',
      x: 5,
      y: 6
    })
  ])
}];



export default <ActiveGame props={defaultBoard} />;
