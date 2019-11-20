import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'minotaur',
      x: 0,
      y: 0
    },
  ],
  B: [
    {
      name: 'minotaur',
      x: 0,
      y: 7
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
