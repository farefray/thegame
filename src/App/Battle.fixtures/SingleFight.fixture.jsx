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
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
