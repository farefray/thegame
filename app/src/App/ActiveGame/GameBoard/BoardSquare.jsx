import React from 'react'
import { useDrop } from 'react-dnd'

import { placePiece} from '../../../socket';

import ItemTypes from './ItemTypes';
import { toBoardPosition, isMyHandPosition, isMyPosition } from '../../../shared/BoardUtils.js';

import { useStateValue } from '../GameBoard.context.js';

import Cell from './Cell';
import Pawn from './Pawn';

export default function BoardSquare({ cellPosition }) {
  const { isDead, isActiveBattleGoing, isBattle, battleStartBoard, myBoard, myHand, storedState } = useStateValue();

  // TODO the same check must be added to backend[without repeating the code!]
  const canMovePawn = (fromPosition, toPosition) => {
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
      const isPositionFromValid = isMyPosition(fromPosition);
      const isPositionToValid = isMyPosition(toPosition);

      if (isPositionFromValid && isPositionToValid) {
        const handUnit = isMyHandPosition(fromPosition) ? myHand[toBoardPosition(fromPosition)] : myBoard[toBoardPosition(fromPosition)];
        return !!handUnit;
      }
    }

    return false;
  };

  const movePawn = (fromPosition, toPosition) => {
    if (canMovePawn(fromPosition, toPosition)) {
      placePiece(storedState, toBoardPosition(fromPosition), toBoardPosition(toPosition));
    }
  }

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PAWN,
    canDrop: (item) => canMovePawn({x: item.position.x, y: item.position.y}, {x:cellPosition.x, y:cellPosition.y}),
    drop: (item) => movePawn({x: item.position.x, y: item.position.y}, {x:cellPosition.x, y:cellPosition.y}),
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
      {!!creature && <Pawn cellPosition={cellPosition} idle={true} name={creature.name} direction={creature.team === 1 ? 3 : 1} />}
    </Cell>
  </div>
}