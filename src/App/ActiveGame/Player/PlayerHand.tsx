import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useSpring, useSprings, animated, interpolate } from 'react-spring';
import Card from '../Deck/Card';

const cardWidth = 32 * 4;

const animateCardAction = (cardAction, index?) => (i) => {
  console.log('springFn -> cardAction', cardAction);
  if (!cardAction) {
    return {
      x: 0,
      y: 0,
      scale: 1,
      op: 1,
      delay: 50 + i * 100,
      from: {
        x: -cardWidth * i,
        y: 0,
        scale: 1,
        op: 0
      }
    };
  }

  return index === i ? { x:0, y: -(i * 100), scale: 1.25, op: 0 } : { x:0, y: 0, scale: 1, op: 1 };
};

function PlayerHand({ hand, cardAction }) {
  const handsRef = useRef(hand);

  const [animations, animate] = useSprings(handsRef.current.length, animateCardAction(cardAction));

  useEffect(() => {
    if (cardAction) {
      animate(
        animateCardAction(cardAction,
          handsRef.current.findIndex(card => card.uuid === cardAction.uuid))
      );
    }
  }, [cardAction]);

  return (
    <React.Fragment>
      {animations.map(({ x, y, scale, op }, i) => (
        <animated.div
          key={i}
          style={{
            transform: interpolate([x, y], (x, y) => `translate3d(${x}px, ${y}px, 0 ) `)
          }}
        >
          <animated.div
            style={{
              transform: interpolate([scale], (s) => `scale(${s}) `),
              opacity: op
            }}
          >
            <Card card={handsRef.current[i]} animated={false} key={handsRef.current[i].uuid} />
          </animated.div>
        </animated.div>
      ))}
    </React.Fragment>
  );
}

export default PlayerHand;
