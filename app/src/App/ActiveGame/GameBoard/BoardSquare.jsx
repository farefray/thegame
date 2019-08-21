import React from 'react'
import { useDrop } from 'react-dnd'

import { placePiece} from '../../../socket';

import ItemTypes from './ItemTypes';

import { useStateValue } from '../GameBoard.context.js';

export default function BoardSquare({ cellPosition, children }) {
  const { isDead, isActiveBattleGoing, isBattle, myBoard, myHand } = useStateValue();

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

  let extraClasses = isOver && canDrop ? 'highlighted' :
    (isOver && !canDrop ? 'highlighted__red' : '');

  if (!isBoard) {
    extraClasses += ' isHand';
  }

  extraClasses += ' cell';

  return <div ref={drop} class={extraClasses}>
      {children}
  </div>
}