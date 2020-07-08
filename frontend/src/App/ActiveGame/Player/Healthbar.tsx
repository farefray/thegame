import React, { useRef, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';

const MAX_HEALTH = 50;
function percent(value) {
  return Math.round(value / (MAX_HEALTH / 100));
}

function Healthbar({ health }) {
  const healthRef = useRef(health);
  const [props, setAnimatedProps] = useSpring(() => ({
    height: percent(healthRef.current) + '%',
    config: config.wobbly
  }));

  useEffect(() => {
    healthRef.current = health;
    setAnimatedProps({ height: percent(healthRef.current)+'%' });
  }, [health]);

  return (
    <div className="healthbar">
      <animated.div style={props} className="healthbar-bar">
        {health}
      </animated.div>
    </div>
  );
}

export default Healthbar;
