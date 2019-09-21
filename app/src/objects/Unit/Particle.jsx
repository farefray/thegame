import React from 'react';

import particleImg from '../../assets/particles/1.gif';

export default function Particle({ particle }) {
  console.log("TCL: Particle -> particle", particle)
  const ref = React.useRef(null);

  React.useEffect(() => {
    const duration = particle.duration;
    const id = particle.id;
    const top = particle.to.top;
    const left = particle.to.left;

    ref.current.animate({
      transform: [`translate(0px, 0px)`, `translate(${left}px, ${top}px)`],
    }, {
      id: id,
      direction: 'normal',
      duration: duration,
      iterations: 1,
    }).onfinish = () => {
      particle.onDone(id)
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
