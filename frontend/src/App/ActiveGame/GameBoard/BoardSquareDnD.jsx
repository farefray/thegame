import React, { useContext } from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import prefix from '../../../UI/utils/prefix';

import { WebSocketContext } from '../../../socket.context';

import ItemTypes from './ItemTypes';

export default function BoardSquareDnD({ cellPosition, children }) {
  // TODO the same check must be added to backend[without repeating the code!]
  const canMovePawn = (fromPosition, toPosition) => {
    const isPositionFromValid = fromPosition.isMyPosition();
    const isPositionToValid = toPosition.isMyPosition();
    return isPositionFromValid && isPositionToValid;
  };

  const websocket = useContext(WebSocketContext);
  const movePawn = (fromPosition, toPosition) => {
    if (canMovePawn(fromPosition, toPosition)) {
      throw new Error('DND WAS DISABLED')
      // websocket.emitMessage('PLACE_PIECE', {
      //   from: fromPosition.toBoardPosition(),
      //   to: toPosition.toBoardPosition()
      // });
    }
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.PAWN,
    canDrop: (item) => canMovePawn(item.position, cellPosition),
    drop: (item) => movePawn(item.position, cellPosition),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  });

  const baseClass = 'cell';
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
