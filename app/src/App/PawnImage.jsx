import React, { useState } from 'react';

const DEFAULT_DIM = 32;

export default function PawnImage ({ src }) {
  const [dims, setDims] = useState({
    height: DEFAULT_DIM,
    width: DEFAULT_DIM
  })

  const onImgLoad = ({ target: img }) => {
    setDims({
      height: img.naturalHeight,
      width: img.naturalWidth
    })
  };

  const padding = dims.height === DEFAULT_DIM ? DEFAULT_DIM: 0;

  return <img className={`pawnImg`} src={src} alt='Pawn' onLoad={onImgLoad} style={{
    paddingTop: padding,
    paddingLeft: padding
  }} />
}
