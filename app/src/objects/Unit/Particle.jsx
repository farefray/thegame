import React from 'react';

// TODO some react transition group to animate this and dissapear!! :D
export default function Particle({ particle }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
  requestAnimationFrame( () => {
      ref.current.style.transform  = `translate(-${particle.to.y}px, -${particle.to.x}px)`;
      ref.current.style.transition = 'transform 0s';
      
      requestAnimationFrame( () => {
        // In order to get the animation to play, we'll need to wait for
        // the 'invert' animation frame to finish, so that its inverted
        // position has propagated to the DOM.
        //
        // Then, we just remove the transform, reverting it to its natural
        // state, and apply a transition so it does so smoothly.
        ref.current.style.transform  = '';
        ref.current.style.transition = 'transform 500ms';

        requestAnimationFrame( () => {
          setTimeout(() => particle.onDone(particle.id), 500);
          //particle.onDone(particle.id)
        });
      });
    });
  });


  return (
    <img
      ref={ref}
      style={{
        position: 'absolute',
        top: particle.to.x + 'px',
        left: particle.to.y + 'px'
      }}
      className={`particle`}
      src="https://vignette.wikia.nocookie.net/tibia/images/6/63/Earth_Missile.gif/revision/latest?cb=20181005132408&path-prefix=en"
      alt="particle"
    />
  );
}
