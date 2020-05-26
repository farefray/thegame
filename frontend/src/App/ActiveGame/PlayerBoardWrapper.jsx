import React, {
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import GameBoard from './GameBoard.jsx';

import Unit from '@/objects/Unit.tsx';

PlayerBoardWrapper.propTypes = {
  boardUnits: PropTypes.arrayOf(PropTypes.object)
};

/**
 * Logical component for GameBoard
 * @param {gameboard.reducer} gameboardState
 * @param {player.reducer} playerState
 * @returns
 */
function PlayerBoardWrapper({ boardUnits }) {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    setBoard([...boardUnits]);
  }, [boardUnits]);

  return <GameBoard hasDnD={true} render={
    () => board.map((unit) => <Unit key={unit.id} unit={unit} isDraggable={true}/>)
  } width="8" height="8" />;
}

  export default PlayerBoardWrapper;