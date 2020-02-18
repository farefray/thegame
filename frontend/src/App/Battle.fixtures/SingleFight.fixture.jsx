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
      name: 'dwarf_geomancer',
      x: 6,
      y: 6
    },
    {
      name: 'dwarf',
      x: 5,
      y: 6
    },
    {
      name: 'dwarf',
      x: 1,
      y: 1
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
