import React from 'react';
import getPawnImageSrc from '../../helpers/pawnImage.helper';

import fallbackImage from '../../assets/monsters/default.png';

export default function UnitImage({ lookType, direction, isMoving }) {
  const [sprite, setSprite] = React.useState(getPawnImageSrc(lookType, direction, !isMoving));

  return (
    <img src={sprite} onError={() => setSprite(fallbackImage)} alt="Unit" style={{ position: 'absolute', bottom: 0, right: 0 }} />
  );
}
