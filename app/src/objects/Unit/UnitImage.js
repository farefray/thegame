import React from 'react';
import getPawnImageSrc from '../../helpers/pawnImage.helper';

import fallbackImage from '../../assets/monsters/default.png';

export default function UnitImage({ lookType, direction, isMoving }) {
  const ref = React.useRef(null);

  const [sprite, setSprite] = React.useState(getPawnImageSrc(lookType, direction, !isMoving));

  React.useEffect(() => {
    ref.current.onerror = () => {
      setSprite(fallbackImage);
    }
  }, [ref]);

  return (
    <img ref={ref} src={sprite} alt="Unit" style={{ position: 'absolute', bottom: 0, right: 0 }} />
  );
}
