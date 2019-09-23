import React from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';

import ItemTypes from '../../App/ActiveGame/GameBoard/ItemTypes';
import getPawnImageSrc from "../../helpers/pawnImage.helper";

export default function IsDraggable({ cellPosition, children }) {
  const [{ isDragging }, drag, preview] = useDrag({
    item: {
      type: ItemTypes.PAWN,
      position: cellPosition
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  });

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
      <DragPreviewImage connect={preview} src={getPawnImageSrc(1, 3, true)} />
    </div>
  );
}
