import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = [{
  owner: 'first_player',
  units: [
    {
      name: 'target_ranged',
      x: 5,
      y: 0
    }
  ]
},
{
  owner: 'second_player',
  units: [
    {
      name: 'elf',
      x: 5,
      y: 7
    },
    {
      name: 'stone',
      x: 5,
      y: 6
    }
  ]
}];



export default <ActiveGame props={defaultBoard} />;
