import React from 'react';

import particleImg from '../../assets/particles/1.gif';

export default function Particle({ particle }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    let top = particle.to.top;
    top = top > 0 ? top + 32 : top - 32; // magic to make it hit into sprite [fixme]
    let left = particle.to.left;
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


  return (
    <img
      ref={ref}
      style={{
        position: 'absolute',
        top: '32px',
        left: '32px'
      }}
      className={`particle`}
      src={particleImg}
      alt="particle"
    />
  );
}
