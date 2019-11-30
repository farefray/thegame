import React from 'react';

export default function Effect({ instance, onDone }) {
  const [imageSrc] = React.useState(require(`../../assets/particles/${instance.lookType}.gif`));
  const { height:dims } = imageSrc;
  const ref = React.useRef(null);

  // rotation
  const radians = Math.atan2(instance.to.top, instance.to.left); // angle between 2 poi ts
  const degrees = (radians * 180 / Math.PI) + 90; // + 90 because all particles are N oriented by default

  // destination [TODO better way to make particle coming INTO unit]
  let top = instance.to.top * 1.5; // >0 = moving down
  let left = instance.to.left * 1.5; // >0 = moving right

  const { id } = instance;
  const speed = instance.speed; // calc by distance to target
  React.useEffect(() => {
    ref.current.animate({
      transform: [
        `translate(0px, 0px) rotate(${degrees}deg)`,
        `translate(${left}px, ${top}px) rotate(${degrees}deg)`
      ],
    }, {
      direction: 'normal',
      duration: speed,
      iterations: 1,
    }).onfinish = () => {
      onDone(id)
    };
  }, []);

  // we need to absolutely place our particles based on their dims if its too small
  const posCorrection = {
    top: `${dims === 32 ? 32 : 0}px`,
    left: `${dims === 32 ? 32 : 0}px`
  };

  return (
    <img
      ref={ref}
      style={{
        transform: `translate(0px, 0px) rotate(${degrees}deg)`,
        top: posCorrection.top,
        left: posCorrection.left
      }}
      className="particle"
      src={imageSrc}
    />
  );
}
