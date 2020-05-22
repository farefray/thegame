import React from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import prefix from '../../../UI/utils/prefix';

import { SocketConnector } from '../../../socketConnector';

import ItemTypes from './ItemTypes';

// TODO the same check must be added to backend[without repeating the code!]
const canMovePawn = (fromPosition, toPosition) => {
  const isPositionFromValid = fromPosition.isMyPosition();
  const isPositionToValid = toPosition.isMyPosition();
  return isPositionFromValid && isPositionToValid;
};

const movePawn = (fromPosition, toPosition) => {
  if (canMovePawn(fromPosition, toPosition)) {
    // ? I doubt we really need socket connector to be included everywhere. TODO Investigate how io() works
    SocketConnector.placePiece(fromPosition.toBoardPosition(), toPosition.toBoardPosition());
  }
};

export default function BoardSquareDnD({ cellPosition, children }) {
  const baseClass = 'cell';

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PAWN,
    canDrop: (item) => canMovePawn(item.position, cellPosition),
    drop: (item) => movePawn(item.position, cellPosition),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  const classes = classNames(baseClass, {
    [prefix(baseClass)('red', true)]: isOver && !canDrop,
    [prefix(baseClass)('green', true)]: isOver && canDrop
  });

  return (
    <div ref={drop} className={classes}>
      {children}
    </div>
  );
}
