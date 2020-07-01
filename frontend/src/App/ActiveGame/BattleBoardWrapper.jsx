import React from 'react';
import { useStoreState } from 'easy-peasy';
import GameBoard from './GameBoard.jsx';
import BattleBoardLogic from './GameBoard/BattleBoardLogic.jsx';


function BattleBoardWrapper() {
  const { battleStartBoard, actionStack } = useStoreState((state) => state.gameboard);

  return (
    <React.Fragment>
      <GameBoard hasDnD={false} width="8" height="8">
        <BattleBoardLogic battleStartBoard={battleStartBoard} actionStack={actionStack} />
      </GameBoard>
    </React.Fragment>
  );
}

export default BattleBoardWrapper;
