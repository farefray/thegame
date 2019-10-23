import React from 'react';
import classNames from 'classnames';

import fallbackImage from '../../assets/monsters/default.png';

export default function UnitImage({ lookType = 1, direction, isMoving, extraClass = '' }) {
  // Load all images which will be required for this unit
  const [sprites] = React.useState({
    idle: {
      1: require(`../../assets/monsters/${lookType}/1.png`),
      2: require(`../../assets/monsters/${lookType}/2.png`),
      3: require(`../../assets/monsters/${lookType}/3.png`),
      4: require(`../../assets/monsters/${lookType}/4.png`)
    },
    animated: {
      1: require(`../../assets/monsters/${lookType}/1.gif`),
      2: require(`../../assets/monsters/${lookType}/2.gif`),
      3: require(`../../assets/monsters/${lookType}/3.gif`),
      4: require(`../../assets/monsters/${lookType}/4.gif`)
    }
  });

  // React.useEffect(() => {
  //   const preloadedSprites = {};
  //   const looks = ['idle', 'animated'];
  //   for (let lookIndex = 0; lookIndex < looks.length; lookIndex++) {
  //     const look = looks[lookIndex];
  //     preloadedSprites[look] = {};
  //     for (let dir = 1; dir < 5; dir++) {
  //       const path = `../../assets/monsters/${lookType}/${look}/${dir}`;
  //       preloadedSprites[look][dir] = require(path);
  //     }
  //   }
    
  //   loadSprites(preloadedSprites); 
  // }, [lookType]);

  const [sprite, setSprite] = React.useState(sprites[isMoving ? 'animated' : 'idle'][direction]);

  React.useEffect(() => {
    setSprite(sprites[isMoving ? 'animated' : 'idle'][direction]);
  }, [direction, isMoving, sprites]);

  const classes = classNames({
    'unit-image': true
  }, extraClass);

  return (
    <img src={sprite} onError={() => setSprite(fallbackImage)} alt="Unit" className={classes} style={{ bottom: 0, right: 0 }} />
  );
}
