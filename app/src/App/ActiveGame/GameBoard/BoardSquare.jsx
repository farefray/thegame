import React from 'react'
import { useDrop } from 'react-dnd'
import ItemTypes from './ItemTypes';
import Cell from './Cell';
import { placePieceEvent, canMovePiece } from '../../../events'
import { toBoardPosition } from '../../../shared/BoardUtils.js';

function movePawn(pawn, x, y) {
  placePieceEvent(pawn.newProps, pawn.position, toBoardPosition(x, y));
}

function canMove(pawn, x, y) {
  return canMovePiece(pawn.newProps, pawn.position, toBoardPosition(x, y)); // its not the safest way
}

export default function BoardSquare ({ key, value, isBoard, newProps, children }) {
  const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemTypes.PAWN,
      canDrop: (item) => canMove(item, value.x, value.y),
      drop: (item) => movePawn(item, value.x, value.y),
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop()
      }),
    })

  let extraClasses = isOver && canDrop ? 'highlighted' :
    (isOver && !canDrop ? 'highlighted__red' : '');

  if (!isBoard) {
    extraClasses += ' isHand';
  }

  return <div ref={drop}>
    <Cell key={key} value={value} isBoard={isBoard} newProps={newProps} extraClasses={extraClasses}>
      {children}
    </Cell>
  </div>
}