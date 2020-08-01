import React, { useEffect, useState } from 'react';
import CardComponent from 'components/Card/CardComponent';
import { useTransition, a } from 'react-spring';
import { CARD_WIDTH } from '@/types/Card.d.ts';

function PlayerHand({ cards, isOpponent }) {
  const [handState, updateState] = useState(cards);

  useEffect(() => {
    updateState(cards);
  }, [cards]);

  const transition = useTransition(handState, {
    keys: (cards) => cards.uuid,
    from: (card, i) => ({ x: -(24 + i * CARD_WIDTH), y: 0, opacity: 0 }),
    enter: (card, i) => ({ x: (24 + i * CARD_WIDTH), y: 0, opacity: 1 }),
    leave: (card, i) => async (next, cancel) => {
      await next({ y: -(48 * 4 * (isOpponent ? -1 : 1)) });
      await next({ x: 1248, y: 24, delay: 1250 }); // todo figure those values dynamically?
    },
    config: {
      mass: 2,
      tension: 225,
      friction: 30
    },
    unique: true
  });

  return (
    transition((style, card, t, i) => (
      <a.div style={style}>
        <CardComponent card={card} revealed={true} />
      </a.div>
    ))
  );
}

export default PlayerHand;
