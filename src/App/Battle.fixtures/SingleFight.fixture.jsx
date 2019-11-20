import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'dwarf_geomancer',
      x: 3,
      y: 1
    },
    {
      name: 'dwarf_geomancer',
      x: 1,
      y: 4
    }
  ],
  B: [
    {
      name: 'elder_beholder',
      x: 6,
      y: 1
    },
    {
      name: 'elf_scout',
      x: 0,
      y: 7
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
