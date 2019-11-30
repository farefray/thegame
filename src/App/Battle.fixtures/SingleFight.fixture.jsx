import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'elder_beholder',
      x: 3,
      y: 3
    },
  ],
  B: [
    {
      name: 'beholder',
      x: 6,
      y: 0
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
