import React from 'react';
import GameBoard from './GameBoard.jsx';

import Unit from '@/objects/Unit.tsx';
import { useStoreState } from 'easy-peasy';

function PlayerBoardWrapper() {
  const board = useStoreState((state) => state.player.board);

  return <GameBoard width="8" height="8">
    {board && board.map((unit) => <Unit key={unit.id} unit={unit}/>)}
  </GameBoard>;
}

export default PlayerBoardWrapper;