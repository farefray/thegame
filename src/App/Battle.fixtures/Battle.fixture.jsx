import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = [{
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
      name: 'minotaur',
      x: 4,
      y: 4
    }
  ]
}];

export default <ActiveGame props={defaultBoard}/>;