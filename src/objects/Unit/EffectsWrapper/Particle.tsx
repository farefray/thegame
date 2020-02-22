import React from 'react';

export default function Particle({ instance, onDone }) {
  const [imageSrc] = React.useState(require(`../../../assets/particles/${instance.lookType}.gif`));
  const { height:dims } = imageSrc;
  const ref = React.useRef<HTMLImageElement>(null);

  const { id, duration, to } = instance;

  const rotationDegrees = (Math.atan2(to.top, to.left) * 180 / Math.PI) + 90; // + 90 because all particles are N oriented by default

  React.useEffect(() => {
    // destination [TODO better way to make particle coming INTO unit]
    const top = instance.to.top * 1.5; // >0 = moving down
    const left = instance.to.left * 1.5; // >0 = moving right

    ref.current.animate({
      transform: [
        `translate(0px, 0px) rotate(${rotationDegrees}deg)`,
        `translate(${left}px, ${top}px) rotate(${rotationDegrees}deg)`
      ],
    }, {
      direction: 'normal',
      duration,
      iterations: 1,
    }).onfinish = () => {
      onDone(id)
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // we need to absolutely place our particles based on their dims if its too small
  const posCorrection = {
    top: `${dims === 32 ? 32 : 0}px`,
    left: `${dims === 32 ? 32 : 0}px`
  };

  return (
    <img
      ref={ref}
      style={{
        transform: `translate(0px, 0px) rotate(${rotationDegrees}deg)`,
        top: posCorrection.top,
        left: posCorrection.left
      }}
      className="particle"
      src={imageSrc}
      alt=""
    />
  );
}
