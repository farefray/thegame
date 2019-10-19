import React from 'react';

import ActiveGame from '../App/ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'dwarf',
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


export default <ActiveGame defaultBoard={defaultBoard} />;