import React from 'react'
import { useDrag, DragPreviewImage } from 'react-dnd'

import ItemTypes from './ItemTypes';
import PawnImage from '../../PawnImage.jsx';

import getPawnImageSrc from './Pawn/pawnImage.helper';
export default function Pawn ({ cellPosition, name, direction, idle, flippedProps }) {
  const [{ isDragging }, drag, preview] = useDrag({
    item: {
      type: ItemTypes.PAWN,
      position: cellPosition
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  let creature = {};
  try {
    const unitJson = JSON.parse(localStorage.getItem('unitJSON'))
    creature = unitJson[name];
  } catch (e) {}
  console.log("TCL: creature", creature)
  
  let lookType = creature.looktype || 25;
  console.log("TCL: lookType", lookType)
  return <div className="pawn" {...flippedProps} style={{height: '64px', width: '64px'}}>
    <DragPreviewImage connect={preview} src={getPawnImageSrc(lookType, 3, true)} />
    <div ref={drag} style={{
      opacity: isDragging ? 0.5 : 1,
      fontSize: 25,
      cursor: 'move',
    }}>
      <PawnImage src={getPawnImageSrc(lookType, direction, idle)} />
    </div>
  </div>
}