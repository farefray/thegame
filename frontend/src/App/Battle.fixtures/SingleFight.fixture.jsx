import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'minotaur',
      x: 6,
      y: 6
    }
  ],
  B: [
    {
      name: 'minotaur',
      x: 2,
      y: 0
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
