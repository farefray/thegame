import React from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';

import ItemTypes from '../../App/ActiveGame/GameBoard/ItemTypes';

export default function IsDraggable({ lookType, cellPosition, children }) {
  const [{ isDragging }, drag, preview] = useDrag({
    item: {
      type: ItemTypes.PAWN,
      position: cellPosition
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const image = require(`../../assets/monsters/${lookType}/1.png`);
  return (
    <div
      ref={drag}
      className="draggablePawn"
      style={{
        height: '64px',
        width: '64px',
        opacity: isDragging ? 0.5 : 1,
        fontSize: 25,
        cursor: 'move'
      }}
    >
      {children}
      <DragPreviewImage connect={preview} src={image} />
    </div>
  );
}
