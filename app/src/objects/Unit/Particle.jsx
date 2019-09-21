import React from 'react';

// TODO some better way
const particlesMap = {
  1: require('../../assets/particles/1.gif')
}

export default function Particle({ particle }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    let top = particle.to.top; // >0 = moving down
    top = top > 0 ? top + 32 : top - 32; // magic to make it hit into sprite [fixme]
    let left = particle.to.left; // >0 = moving right
    left = left > 0 ? left + 32 : left - 32; // magic to make it hit into sprite [fixme]
    ref.current.animate({
      transform: [`translate(0px, 0px)`, `translate(${left}px, ${top}px)`],
    }, {
      direction: 'normal',
      duration: particle.duration,
      iterations: 1,
    }).onfinish = () => {
      particle.onDone(particle.id)
    };
  }, [particle]);


  const rotation = (particle.to.top > 0 ? -1 : 1) // by default particle is turned up
    * (particle.to.left > 0 ? 90 : 180); // calculate rotation
  return (
    <img
      ref={ref}
      style={{
        position: 'absolute',
        top: '32px',
        left: '32px',
        transform: `rotate(${rotation}deg)`
      }}
      className={`particle`}
      src={particlesMap[particle.lookType]}
      alt="particle"
    />
  );
}
