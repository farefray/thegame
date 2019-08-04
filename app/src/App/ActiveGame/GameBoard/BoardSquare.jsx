import React from 'react'
import { useDrop } from 'react-dnd'

import { placePiece} from '../../../socket';

import ItemTypes from './ItemTypes';

import { useStateValue } from '../GameBoard.context.js';

import Cell from './Cell';
import Pawn from './Pawn';

export default function BoardSquare({ cellPosition }) {
  const { isDead, isActiveBattleGoing, isBattle, battleStartBoard, myBoard, myHand } = useStateValue();

  // TODO the same check must be added to backend[without repeating the code!]
  const canMovePawn = (fromPosition, toPosition) => {
    // todo spectating [prop.visiting !== prop.index]
    if (isDead 
      || (!isActiveBattleGoing && isBattle)) {
      return false;
    }
  
    const fromBoardPosition = fromPosition.toBoardPosition();
    if (isActiveBattleGoing) {
      // only hand to hand movement is allowed
      const handUnit = myHand[fromBoardPosition];
      return (handUnit && fromPosition.isMyHandPosition() && toPosition.isMyHandPosition());
    } else {
      const isPositionFromValid = fromPosition.isMyPosition();
      const isPositionToValid = toPosition.isMyPosition();

      if (isPositionFromValid && isPositionToValid) {
        const handUnit = fromPosition.isMyHandPosition() ? myHand[fromBoardPosition] : myBoard[fromBoardPosition];
        return !!handUnit;
      }
    }

    return false;
  };

  const movePawn = (fromPosition, toPosition) => {
    if (canMovePawn(fromPosition, toPosition)) {
      placePiece(fromPosition.toBoardPosition(), toPosition.toBoardPosition());
    }
  }

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PAWN,
    canDrop: (item) => canMovePawn(item.position, cellPosition),
    drop: (item) => movePawn(item.position, cellPosition),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    }),
  })

  const isBoard = cellPosition.isBoard();

  // Picking map, its hand, board or battleBoard
  const boardMap = isBoard && isActiveBattleGoing
    ? battleStartBoard : (isBoard ? myBoard : myHand);

  const creature = boardMap[cellPosition.toBoardPosition()];

  let extraClasses = isOver && canDrop ? 'highlighted' :
    (isOver && !canDrop ? 'highlighted__red' : '');

  if (!isBoard) {
    extraClasses += ' isHand';
  }

  return <div ref={drop}>
    <Cell cellPosition={cellPosition} extraClasses={extraClasses}>
      {!!creature && <Pawn cellPosition={cellPosition} idle={true} name={creature.name} direction={creature.team === 1 ? 3 : 1} />}
    </Cell>
  </div>
}