import React, { FunctionComponent } from 'react';
import { animated, useSpring, interpolate } from 'react-spring';
import { getRandomArbitrary } from '@/utils/misc';

export interface IAnimationProps {
  stackPosition?: number;
  key?: string | number | undefined;
}

type AnimationProps = { x: number; y: number; rotation: number; }

const CardAnimation: FunctionComponent<IAnimationProps> = ({ children, stackPosition = 0 }) => {

  const { x, y, rotation } = useSpring<AnimationProps>({
    from: { x: 0, y: -700, rotation: 0 },
    x: 0,
    y: -(stackPosition * getRandomArbitrary(4, 10)),
    rotation: getRandomArbitrary(-5, 5),
    delay: stackPosition >= 0 ? (stackPosition * 100 + 100) : 0
  });

  return (
    <animated.div className="card-animation" style={{
      transform: interpolate([x, y, rotation], (x, y, rotation) => `translate3d(${x}px, ${y}px, 0 ) `)
    }}>
      <animated.div className="card-animation" style={{
        transform: rotation.interpolate((r) => ` rotate(${r}deg) `)
       }}>{children}</animated.div>
    </animated.div>
  );
};

export default CardAnimation;
