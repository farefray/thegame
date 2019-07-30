import React from 'react'
import { useDrop } from 'react-dnd'
import ItemTypes from './ItemTypes';
import { placePieceEvent, canMovePiece } from '../../../events'
import { toBoardPosition } from '../../../shared/BoardUtils.js';

import { useStateValue } from '../GameBoard.context.js';

import Cell from './Cell';
import Pawn from './Pawn';

function movePawn (pawn, x, y) {
  placePieceEvent(pawn.newProps, pawn.position, toBoardPosition(x, y));
}

function canMove (pawn, x, y) {
  return canMovePiece(pawn.newProps, pawn.position, toBoardPosition(x, y)); // its not the safest way
}

export default function BoardSquare ({ cellPosition }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PAWN,
    canDrop: (item) => canMove(item, cellPosition.x, cellPosition.y),
    drop: (item) => movePawn(item, cellPosition.x, cellPosition.y),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    }),
  })

  const [{ onGoingBattle, battleStartBoard, myBoard, myHand }] = useStateValue();

  const isBoard = cellPosition.y !== 0;

  // Picking map, its hand, board or battleBoard
  const boardMap = isBoard && onGoingBattle
    ? battleStartBoard : (isBoard ? myBoard : myHand);
  const boardPosition = toBoardPosition(cellPosition.x, cellPosition.y);
  const creature = boardMap[boardPosition];

  let extraClasses = isOver && canDrop ? 'highlighted' :
    (isOver && !canDrop ? 'highlighted__red' : '');

  if (!isBoard) {
    extraClasses += ' isHand';
  }

  return <div ref={drop}>
    <Cell cellPosition={cellPosition} extraClasses={extraClasses}>
      {!!creature && <Pawn position={boardPosition} idle={true} name={creature.name} direction={creature.team === 1 ? 3 : 1} />}
    </Cell>
  </div>
}