import React from 'react';
import classNames from 'classnames';

export default function Effect({ instance, onDone }) {
  const isParticle = !!instance.to;
  const [imageSrc] = React.useState(require(`../../assets/${isParticle ? 'particles' : 'effects'}/${instance.lookType}.gif`));
  const { height:dims } = imageSrc;
  const ref = React.useRef(null);

  const { id } = instance;
  const duration = instance.speed;

  let degrees; // rotation for particles
  React.useEffect(() => {
    if (isParticle) {
      const radians = Math.atan2(instance.to.top, instance.to.left); // angle between 2 poi ts
      degrees = (radians * 180 / Math.PI) + 90; // + 90 because all particles are N oriented by default

      // destination [TODO better way to make particle coming INTO unit]
      const top = instance.to.top * 1.5; // >0 = moving down
      const left = instance.to.left * 1.5; // >0 = moving right

      ref.current.animate({
        transform: [
          `translate(0px, 0px) rotate(${degrees}deg)`,
          `translate(${left}px, ${top}px) rotate(${degrees}deg)`
        ],
      }, {
        direction: 'normal',
        duration,
        iterations: 1,
      }).onfinish = () => {
        onDone(id)
      };
    } else {
      setTimeout(() => {
        onDone(id);
      }, duration)
    }
  }, []);

  // we need to absolutely place our particles based on their dims if its too small
  const posCorrection = {
    top: `${dims === 32 ? 32 : 0}px`,
    left: `${dims === 32 ? 32 : 0}px`
  };

  const classes = classNames({
    'particle': isParticle,
    'effect': !isParticle
  });

  return (
    <img
      ref={ref}
      style={{
        transform: `translate(0px, 0px) rotate(${degrees}deg)`,
        top: posCorrection.top,
        left: posCorrection.left
      }}
      className={classes}
      src={imageSrc}
    />
  );
}
