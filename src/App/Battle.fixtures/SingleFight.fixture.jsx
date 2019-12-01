import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'minotaur_mage',
      x: 3,
      y: 3
    },
  ],
  B: [
    {
      name: 'minotaur',
      x: 6,
      y: 0
    },
    {
      name: 'minotaur',
      x: 5,
      y: 0
    },
    {
      name: 'minotaur',
      x: 6,
      y: 1
    },
    {
      name: 'minotaur',
      x: 5,
      y: 1
    },
    {
      name: 'minotaur',
      x: 4,
      y: 1
    },
    {
      name: 'minotaur',
      x: 4,
      y: 2
    },
    {
      name: 'minotaur',
      x: 4,
      y: 3
    },
    {
      name: 'minotaur',
      x: 4,
      y: 4
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
