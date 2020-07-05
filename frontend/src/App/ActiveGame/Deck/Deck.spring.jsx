import React, { useRef, useEffect } from 'react';
import { useSprings, animated, interpolate } from 'react-spring';
import { useFirstMountState, useEffectOnce } from 'react-use';
import Card from './Card';

const cardWidth = 32 * 4;
// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 });
const from = (i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
const deal = (i) => ({ x: i * cardWidth - 357, y: 0, scale: 1, rot: 0, delay: i * 100 });

// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(600px) rotateX(10deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const springFn = (cardsRef, stage, newCardsRef) => (i) => {
  switch (stage) {
    case 'deal': {
      if (i < 5) return {}
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
  const cardsRef = useRef(
    cards.map((_, index) => cards[index])
  );

  console.log('useRef', cardsRef.current);
  const [springs, setSprings] = useSprings(cardsRef.current.length, springFn(cardsRef.current, 'mount'));

  useEffectOnce(() => {
    setSprings(springFn(cardsRef.current, 'init'));
  });

  useEffect(() => {
    if (cards.length !== cardsRef.current.length) {
      setSprings(springFn(cardsRef.current, 'deal', cards));
      cardsRef.current = cards.map((_, index) => cards[index]);
    }
  }, [cards]);


  return springs.map(({ x, y, rot, scale }, i) => (
    <animated.div key={i} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}>
      <animated.div style={{ transform: interpolate([rot, scale], trans) }}>
        <Card card={cardsRef.current[i]} animated={false} />
      </animated.div>
    </animated.div>
  ));
}

export default DeckSpring;
