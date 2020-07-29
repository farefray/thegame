import React, { useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

function Gold({ gold }) {
  const goldRef = useRef(gold);
  const [spring, set] = useSpring(() => {
    return { from: { val: 0 }, to: { val: goldRef.current } };
  });

  useEffect(() => {
    set(() => {
      return { from: { val: goldRef.current }, to: { val: gold } };
    });

    goldRef.current = gold;
  }, [gold, set]);

  return (
    <animated.div className="gold">
      {spring.val.to(val => Math.floor(val))}
    </animated.div>
  );
}

export default Gold;
