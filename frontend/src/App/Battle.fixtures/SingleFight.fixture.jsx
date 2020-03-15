import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
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
  ],
  B: [
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
};

export default <ActiveGame props={defaultBoard}/>;
