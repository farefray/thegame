import React from 'react';

export default function Particle({ particle }) {
  const ref = React.useRef(null);

  const duration = particle.duration;
  const id = particle.id;
  const top = particle.to.top;
  const left = particle.to.left + 32;
  React.useEffect(() => {
    ref.current.animate({
      transform: [`translate(0px, 0px)`, `translate(${top}px, ${left}px)`],
    }, {
      id: id,
      direction: 'normal',
      duration: duration,
      iterations: 1,
    }).onfinish = () => {
      particle.onDone(id)
    };
  }, [id, duration, top, left]);


  return (
    <img
      ref={ref}
      style={{
        position: 'absolute',
        top: '32px',
        left: '32px'
      }}
      className={`particle`}
      src="https://vignette.wikia.nocookie.net/tibia/images/6/63/Earth_Missile.gif/revision/latest?cb=20181005132408&path-prefix=en"
      alt="particle"
    />
  );
}
