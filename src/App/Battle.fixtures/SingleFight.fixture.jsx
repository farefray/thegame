import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'dwarf',
      x: 0,
      y: 3
    }
  ],
  B: [
    {
      name: 'minotaur',
      x: 1,
      y: 4
    },
    {
      name: 'minotaur',
      x: 2,
      y: 4
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
