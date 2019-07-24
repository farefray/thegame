import React from 'react'
import { useDrag } from 'react-dnd'

import ItemTypes from './ItemTypes';
import PawnImage from '../../PawnImage.jsx';

export default function Pawn ({ position, name, back, sideLength, classList, newProps, isBoard }) {
  const [{ isDragging }, drag] = useDrag({
    item: {
      type: ItemTypes.PAWN,
      newProps: newProps,
      position: position
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  return <div ref={drag} style={{
    opacity: isDragging ? 0.5 : 1,
    fontSize: 25,
    cursor: 'move',
  }}>
    <PawnImage name={name} back={back} sideLength={sideLength} classList={classList} newProps={newProps} isBoard={isBoard} />
  </div>
}