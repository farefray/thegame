import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = [{
  owner: 'first_player',
  units: [
    {
      name: 'dwarf_guard',
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
    },
    {
      name: 'minotaur',
      x: 3,
      y: 5
    },
    {
      name: 'minotaur',
      x: 5,
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
}];



export default <ActiveGame props={defaultBoard} />;
