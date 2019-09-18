import React from 'react';


export default function PawnImage({ particle }) {
  console.log(particle);
  // todo get particle params, animate and then destoy? :)
  return (
    <img
      className={`particle`}
      src="https://vignette.wikia.nocookie.net/tibia/images/6/63/Earth_Missile.gif/revision/latest?cb=20181005132408&path-prefix=en"
      alt="particle"
    />
  );
}
