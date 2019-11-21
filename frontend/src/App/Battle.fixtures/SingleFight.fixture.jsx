import React from 'react';
import ActiveGame from '../ActiveGame';

const defaultBoard = {
  A: [
    {
      name: 'elf_scout',
      x: 0,
      y: 3
    },
  ],
  B: [
    {
      name: 'elf_scout',
      x: 0,
      y: 7
    }
  ]
};

export default <ActiveGame props={defaultBoard}/>;
