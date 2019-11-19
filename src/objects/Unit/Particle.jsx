import React from 'react';

export default function Particle({ particle }) {
  const [imageSrc] = React.useState(require(`../../assets/particles/${particle.lookType}.gif`));

  const ref = React.useRef(null);

  React.useEffect(() => {
    // destination
    let top = particle.to.top; // >0 = moving down
    top = top > 0 ? top + 32 : top - 32; // magic to make it hit into sprite [fixme]
    let left = particle.to.left; // >0 = moving right
    left = left > 0 ? left + 32 : left - 32; // magic to make it hit into sprite [fixme]

    // rotation
    const radians = Math.atan2(particle.to.top, particle.to.left); // angle between 2 poi ts
    const degrees = (radians * 180 / Math.PI) + 90; // + 90 because all particles are N oriented by default
    ref.current.animate({
      transform: [
        `translate(0px, 0px) rotate(${degrees}deg)`,
        `translate(${left}px, ${top}px) rotate(${degrees}deg)`
      ],
    }, {
      direction: 'normal',
      duration: particle.duration,
      iterations: 1,
    }).onfinish = () => {
      particle.onDone(particle.id)
    };
  }, [particle]);

  
  return (
    <img
      ref={ref}
      style={{
        position: 'absolute'
      }}
      className={`particle`}
      src={imageSrc}
      alt="particle"
    />
  );
}
