import React from 'react';
import { useStoreState } from 'easy-peasy';
import GameBoard from './GameBoard.jsx';
import BattleBoardLogic from './GameBoard/BattleBoardLogic.jsx';


function BattleBoardWrapper() {
  const { startBoard, actionStack } = useStoreState((state) => state.gameboard);

  return (
    <React.Fragment>
      <GameBoard hasDnD={false} width="8" height="8">
        <BattleBoardLogic startBoard={startBoard} actionStack={actionStack} />
      </GameBoard>
    </React.Fragment>
  );
}

export default BattleBoardWrapper;
