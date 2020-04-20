import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = [{
  owner: 'first_player',
  units: [
    {
      name: 'dwarf_guard',
      x: 5,
      y: 0
    }
  ]
},
{
  owner: 'second_player',
  units: [
    {
      name: 'minotaur',
      x: 5,
      y: 7
    },
    {
      name: 'minotaur',
      x: 5,
      y: 6
    },
    {
      name: 'minotaur',
      x: 5,
      y: 5
    }
  ]
}];



export default <ActiveGame props={defaultBoard} />;
