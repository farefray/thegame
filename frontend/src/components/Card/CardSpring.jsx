import React, { useRef, useState } from 'react';
import { useSpring, animated } from 'react-spring';

// const animateCardAction = (cardAction, index?) => (i) => {
//   const cardWidth = 32 * 4;
//   if (!cardAction) {
//     return {
//       x: 0,
//       y: 0,
//       scale: 1,
//       op: 1,
//       delay: 50 + i * 100,
//       from: {
//         x: -cardWidth * i,
//         y: 0,
//         scale: 1,
//         op: 0
//       }
//     };
//   }

//   return index === i ? { x:0, y: -(i * 100), scale: 1.25, op: 0 } : { x:0, y: 0, scale: 1, op: 1 };
// };

function CardSpring(children) {
  const ref = useRef();

  const [ishovered, setHovered] = useState(false);

  const [animatedprops, setAnimatedProps] = useSpring(() => {
    return {
      // Array containing [rotateX, rotateY, and scale] values.
      // We store under a single key (xys) instead of separate keys ...
      xys: [0, 0, 1],
      config: { mass: 1, tension: 350, friction: 40, precision: 0.00001 }
    };
  });

  return (
    <animated.div
      ref={ref}
      className="card-spring"
      onMouseEnter={() => setHovered(true)}
      onMouseMove={({ clientX, clientY }) => {
        // Get mouse x position within card
        const x =
          clientX -
          (ref.current.offsetLeft -
            (window.scrollX || window.pageXOffset || document.body.scrollLeft));

        // Get mouse y position within card
        const y =
          clientY -
          (ref.current.offsetTop -
            (window.scrollY || window.pageYOffset || document.body.scrollTop));

        // Set animated values based on mouse position and card dimensions
        const dampen = 30; // Lower the number the less rotation
        const xys = [
          -(y - ref.current.clientHeight / 2) / dampen, // rotateX
          (x - ref.current.clientWidth / 2) / dampen, // rotateY
          1.05 // Scale
        ];

        // Update values to animate to
        setAnimatedProps({ xys: xys });
      }}
      onMouseLeave={() => {
        setHovered(false);
        // Set xys back to original
        setAnimatedProps({ xys: [0, 0, 1] });
      }}
      style={{
        zIndex: ishovered ? 2 : 1,
        transform:
        animatedprops.xys.interpolate(
          (x, y, s) =>
            `perspective(100px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`
        )
      }}
    >
      {children}
    </animated.div>
  );
}

export default CardSpring;