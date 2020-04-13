import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'target',
      x: 4,
      y: 4
    }
  ],
  B: [
    {
      name: 'minotaur',
      x: 3,
      y: 7
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;