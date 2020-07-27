import React, { useRef, useEffect } from 'react';
import { useSprings, animated, interpolate } from 'react-spring';
import { useEffectOnce } from 'react-use';
import Card from '@/components/Card';

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100, op: 1 });
const from = (i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000, op: 1 });
const deal = (i) => ({ x: 0, y: 0, scale: 1, rot: 0, delay: i * 100, op: 0.5 });

// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(600px) rotateX(10deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const springFn = (stage, params) => (i) => {
  switch (stage) {
    case 'deal': {
      if (i < params.amount) {
        // not changed
        return {}
      }

      return { ...deal(i) };
    }

    case 'init': {
      return { ...to(i), from: from(i) };
    }

    case 'mount':
    default: {
      return { ...from(i), from: from(i) };
    }
  }

  // return { ...to(i), from: from(i) };
};

function DeckSpring(cards) {
  const cardsRef = useRef(cards);

  const [springs, setSprings] = useSprings(cardsRef.current.length, springFn('mount'));

  useEffectOnce(() => {
    setSprings(springFn('init'));
  });

  useEffect(() => {
    if (cards.length !== cardsRef.current.length) {
      setSprings(springFn('deal', {
        amount: cardsRef.current.length - cards.length
      }));
      cardsRef.current = cards;
    }
  }, [cards.length, cards, setSprings]);


  return springs.map(({ x, y, rot, scale, op }, i) => (
    <animated.div key={cardsRef.current[i].uuid || i} style={{
      transform: interpolate([x, y], (x, y) => `translate3d(${x}px, ${y}px, 0 ) `)
    }}>
      <animated.div style={{
        transform: interpolate([rot, scale], trans),
        opacity: op
      }}>
        <Card card={cardsRef.current[i]} animated={false} revealed={false} />
      </animated.div>
    </animated.div>
  ));
}

export default DeckSpring;
