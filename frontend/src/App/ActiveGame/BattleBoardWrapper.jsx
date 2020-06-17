import React from 'react';
import PropTypes from 'prop-types';
import GameBoard from './GameBoard.jsx';
import BattleBoardLogic from './GameBoard/BattleBoardLogic.jsx';

BattleBoardWrapper.propTypes = {
  gameboardState: PropTypes.shape({
    actionStack: PropTypes.array,
    battleStartBoard: PropTypes.arrayOf(PropTypes.object)
  })
};

/**
 * Logical component for GameBoard
 * @param {gameboard.reducer} gameboardState
 * @returns
 */
function BattleBoardWrapper({ gameboardState }) {
  const { battleStartBoard, actionStack } = gameboardState;

  return (
    <React.Fragment>
      <GameBoard hasDnD={false} width="8" height="8">
        <BattleBoardLogic battleStartBoard={battleStartBoard} actionStack={actionStack} />
      </GameBoard>
    </React.Fragment>
  );
}

export default BattleBoardWrapper;
