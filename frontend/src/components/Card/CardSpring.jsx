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

function CardSpring({children}) {
  const ref = useRef();

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
      style={{
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