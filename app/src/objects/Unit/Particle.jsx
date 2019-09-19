import React from 'react';

// TODO some react transition group to animate this and dissapear!! :D
export default function PawnImage({ particle }) {
  console.log(particle);
  // todo get particle params, animate and then destoy? :)
  let top = 0, left = 0;
  setTimeout(() => {
    top = particle.to.x;
    left = particle.to.y;
  }, 0);

  return (
    <img
      style={{
        position: 'absolute',
        top: top + 'px',
        left: left + 'px'
      }}
      className={`particle`}
      src="https://vignette.wikia.nocookie.net/tibia/images/6/63/Earth_Missile.gif/revision/latest?cb=20181005132408&path-prefix=en"
      alt="particle"
    />
  );
}
