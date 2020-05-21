import React from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import prefix from '../../../UI/utils/prefix';

import { SocketConnector } from '../../../socketConnector';

import ItemTypes from './ItemTypes';

import { useStateValue } from '../GameBoard.context.js';

export default function BoardSquare({ cellPosition, children }) {
  const { isDead, isActiveBattleGoing } = useStateValue();

  // TODO the same check must be added to backend[without repeating the code!]
  const canMovePawn = (fromPosition, toPosition) => {
    if (isDead) {
      return false;
    }

    if (isActiveBattleGoing) {
      // only hand to hand movement is allowed
      return fromPosition.isMyHandPosition() && toPosition.isMyHandPosition();
    } else {
      const isPositionFromValid = fromPosition.isMyPosition();
      const isPositionToValid = toPosition.isMyPosition();
      return (isPositionFromValid && isPositionToValid);
    }
  };

  const movePawn = (fromPosition, toPosition) => {
    if (canMovePawn(fromPosition, toPosition)) {
      SocketConnector.placePiece(fromPosition.toBoardPosition(), toPosition.toBoardPosition());
    }
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PAWN,
    canDrop: item => canMovePawn(item.position, cellPosition),
    drop: item => movePawn(item.position, cellPosition),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  const isBoard = cellPosition.isBoard();

  const baseClass = 'cell';
  const classes = classNames(baseClass, {
    [prefix(baseClass)('hand')]: !isBoard,
    [prefix(baseClass)('red', true)]: isOver && !canDrop,
    [prefix(baseClass)('green', true)]: isOver && canDrop
  });

  return (
    <div ref={drop} className={classes}>
      {children}
    </div>
  );
}
