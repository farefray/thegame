import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { useSpring, useSprings, animated, interpolate } from 'react-spring'
import Card from '../Deck/Card';

const deal = (i) => ({ y: i * 100, scale: 1.25, delay: i * 100, op: 0 });

const animateCardAction = (cardAction) => (i) => {
  console.log("springFn -> cardAction", cardAction)
  if (!cardAction) {
    return { y: 0, scale: 1, op: 1 };
  }

  return { ...deal(i) };
};

function PlayerHand(hand, cardAction) {
  const handsRef = useRef(hand);
  console.log("PlayerHand -> handEffects", cardAction)
  console.log("PlayerHand -> hand", hand)
  console.log("PlayerHand -> handsRef.current.length", handsRef.current.length)

  const [animations, animate] = useSprings(handsRef.current.length, animateCardAction(cardAction));

  useEffect(() => {
    if (cardAction) {
      console.log("PlayerHand -> cardAction", cardAction)
      animate(animateCardAction(cardAction));
    }
  }, [cardAction]);

  return animations.map(({ y, scale, op }, i) => (
    <animated.div key={i} style={{
      transform: interpolate([y], (y) => `translate3d(0, ${y}px, 0 ) `)
    }}>
      <animated.div style={{
        transform: interpolate([scale], (s) => `scale(${s}) `),
        opacity: op
      }}>
        <Card card={handsRef.current[i]} animated={false} key={handsRef.current[i].uuid} />
      </animated.div>
    </animated.div>
  ));
  }

export default PlayerHand;
