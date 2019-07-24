import React from 'react'
import { useDrop } from 'react-dnd'
import ItemTypes from './ItemTypes';
import Cell from './Cell';
import { placePieceEvent, canMovePiece } from '../../../events'

function movePawn(pawn, x, y) {
  console.log(pawn);
  console.log(x, y);
  const movePos = x + ',' + y; // todo
  placePieceEvent(pawn.newProps, pawn.position, movePos);
}

function canMove(pawn, x, y) {
  const movePos = x + ',' + y; // todo
  return canMovePiece(pawn.newProps, pawn.position, movePos); // its not the safest way
}

export default function BoardSquare ({ key, value, isBoard, map, newProps }) {
  const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemTypes.PAWN,
      canDrop: (item, monitor) => canMove(monitor.getItem(), value.x, value.y),
      drop: (item, monitor) => movePawn(monitor.getItem(), value.x, value.y),
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop()
      }),
    })

  const extraClasses = isOver && canDrop ? 'highlighted' :
    (isOver && !canDrop ? 'highlighted__red' : '');

  return <div ref={drop}>
    <Cell key={key} value={value} isBoard={isBoard} map={map} newProps={newProps} extraClasses={extraClasses}/>
  </div>
}