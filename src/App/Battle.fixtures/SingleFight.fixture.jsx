import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'bigboy',
      x: 6,
      y: 6
    }
  ],
  B: [
    {
      name: 'bigboy',
      x: 2,
      y: 0
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
