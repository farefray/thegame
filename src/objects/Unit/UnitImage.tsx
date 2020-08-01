import React from 'react';
import classNames from 'classnames';

import fallbackImage from '../../assets/monsters/default.png';

/**
 *
 * @todo refactor this
 * preload and cache images somehow
 */
export default function UnitImage({
  lookType,
  direction,
  isMoving,
  extraClass = ''
}: {
  lookType: number;
  direction: number;
  isMoving: boolean;
  extraClass: string;
}) {
  if (!lookType) {
    throw new Error('Looktype for monsters is missing');
  }

  // Load all images which will be required for this unit
  const [sprites, updateSprites] = React.useState({
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

  React.useEffect(() => {
    updateSprites({
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
  }, [lookType]);

  const [sprite, setSprite] = React.useState(sprites[isMoving ? 'animated' : 'idle'][direction]);

  React.useEffect(() => {
    setSprite(sprites[isMoving ? 'animated' : 'idle'][direction]);
  }, [direction, isMoving, sprites]);

  const classes = classNames(
    {
      'unit-image': true
    },
    extraClass
  );

  return <img src={sprite} onError={() => setSprite(fallbackImage)} alt="Unit" className={classes} style={{
    bottom: 0,
    right: 0
  }} />;
}
