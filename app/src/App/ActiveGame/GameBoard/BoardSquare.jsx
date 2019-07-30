import React from 'react'
import { useDrop } from 'react-dnd'
import ItemTypes from './ItemTypes';
import { toBoardPosition, isMyHandPosition } from '../../../shared/BoardUtils.js';

import { useStateValue } from '../GameBoard.context.js';

import Cell from './Cell';
import Pawn from './Pawn';


export function placePieceEvent(prop, fromParam, to) {
  // to is on valid part of the board
  const from = String(fromParam);
  if (prop.isDead) {
    return;
  } else if (prop.visiting !== prop.index) {
    return;
  }
  if (!prop.isActiveBattleGoing && prop.isBattle) {
    return;
  }
  if (from && to) {
    const splitted = to.split(',');
    const fromSplitted = from.split(',');
    const validPos = (splitted.length === 2 ? splitted[1] < 4 && splitted[1] >= 0 : true) && splitted[0] < 8 && splitted[0] >= 0;
    const unitExists = (fromSplitted.length === 2 ? prop.myBoard[fromParam] : prop.myHand[from])
    // console.log('@placePieceEvent', fromSplitted, validPos, unitExists, prop.myHand);
    if (validPos && unitExists && !prop.isActiveBattleGoing) {
      // console.log('Sending place piece!')
      placePiece(prop.storedState, from, to);
    } else {
      // Hand to hand movement during battle allowed
      if (validPos && unitExists && prop.isActiveBattleGoing && !from.includes(',') && !to.includes(',')) {
        placePiece(prop.storedState, from, to);
      } else {
        updateMessage(prop, 'Invalid target placing!', 'error');
      }
    }
  }
}

function movePawn(pawn, x, y) {
  placePieceEvent(pawn.newProps, pawn.position, toBoardPosition(x, y));
}

export default function BoardSquare({ cellPosition }) {
  const { isDead, isActiveBattleGoing, isBattle, battleStartBoard, myBoard, myHand } = useStateValue();

  // TODO the same check must be added to backend[without repeating the code!]
  const canMovePiece = (fromPosition, toPosition) => {
    // todo spectating [prop.visiting !== prop.index]
    if (isDead 
      || (!isActiveBattleGoing && isBattle)) {
      return false;
    }
  
    if (isActiveBattleGoing) {
      // only hand to hand movement is allowed
      const handUnit = myHand[toBoardPosition(fromPosition)];
      return (handUnit && isMyHandPosition(fromPosition) && isMyHandPosition(toPosition));
    } else {

    }

    const isPositionFromValid = isMyBoardPosition(fromPosition);
    const isPositionToValid = isMyBoardPosition(toPosition);
    const unitExists = (fromSplitted.length === 2 ? myBoard[fromParam] : myHand[from])
    if (validPos && unitExists && !isActiveBattleGoing) {
      // console.log('Sending place piece!')
      return true;
    } else {
      // Hand to hand movement during battle allowed
      if (validPos && unitExists && isActiveBattleGoing && !from.includes(',') && !to.includes(',')) {
        return true
      } else {
        return false
      }
    }
  };
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PAWN,
    canDrop: (item) => canMovePiece({x: item.position.x, y: item.position.y}, {x:cellPosition.x, y:cellPosition.y}),
    drop: (item) => movePawn(item, cellPosition.x, cellPosition.y),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    }),
  })

  const isBoard = cellPosition.y !== 0;

  // Picking map, its hand, board or battleBoard
  const boardMap = isBoard && isActiveBattleGoing
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