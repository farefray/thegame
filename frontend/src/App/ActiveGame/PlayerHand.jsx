import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import GameBoard from './GameBoard.jsx';

import Unit from '@/objects/Unit.tsx';

PlayerHand.propTypes = {
  handUnits: PropTypes.arrayOf(PropTypes.object)
};

function PlayerHand({ handUnits }) {
  const [board, setBoard] = useState([]);

  // If board is being updated by backend, update board state for this component
  useEffect(() => {
    setBoard([...handUnits]);
  }, [handUnits]);

  return (
    <GameBoard hasDnD={true} width="8" height="1" startingY={-1}>
      {board.map((unit) => (
        <Unit key={unit.id} unit={unit} isDraggable={true} />
      ))}
    </GameBoard>
  );
}

export default PlayerHand;
