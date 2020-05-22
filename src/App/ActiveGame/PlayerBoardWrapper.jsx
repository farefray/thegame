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
  const [gameboardKey, setGameboardKey] = useState(1);
  const [board, setBoard] = useState([]);

  useEffect(() => {
    setBoard([...boardUnits]);
    setGameboardKey(gameboardKey + 1)
  }, [boardUnits]);

  return <GameBoard render={
    () => board.map((unit) => <Unit key={unit.id} unit={unit} />)
  } width="8" height="8" />;
}

  export default PlayerBoardWrapper;