import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'dwarf_geomancer',
      x: 6,
      y: 6
    }, 
    {
      name: 'dwarf_geomancer',
      x: 5,
      y: 6
    }
  ],
  B: [
    {
      name: 'dwarf_geomancer',
      x: 2,
      y: 0
    },
    {
      name: 'dwarf_geomancer',
      x: 2,
      y: 1
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
