import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'minotaur',
      x: 1,
      y: 1
    }
  ],
  B: [
    {
      name: 'dwarf',
      x: 2,
      y: 1
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
