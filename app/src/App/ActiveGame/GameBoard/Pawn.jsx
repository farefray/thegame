import React from 'react'
import PawnImage from '../../PawnImage.jsx';

export default function Pawn({ name, back, sideLength, classList, newProps, isBoard }) {
  return <PawnImage name={name} back={back} sideLength={sideLength} classList={classList} newProps={newProps} isBoard={isBoard}/>
}