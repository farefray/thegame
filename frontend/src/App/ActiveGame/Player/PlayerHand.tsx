import React, { useEffect, useState } from 'react';
import CardComponent from 'components/Card/CardComponent';
import { useTransition, a } from 'react-spring';
import { CARD_WIDTH } from '@/types/Card.d.ts';

function PlayerHand({ cards }) {
  const [handState, updateState] = useState(cards);

  useEffect(() => {
    updateState(cards);
  }, [cards]);

  const transition = useTransition(handState, {
    keys: (cards) => cards.uuid,
    from: (card, i) => ({ x: -(24 + i * CARD_WIDTH), y: 0, opacity: 0 }),
    enter: { x: 0, y: 0, opacity: 1 },
    leave: (card, i) => {
      return [{ x: 0, y: -(24 + i * CARD_WIDTH) },
        { transform: 'perspective(600px) rotateX(180deg)', color: '#28d79f' },
        { transform: 'perspective(600px) rotateX(0deg)' }];
    },
    config: {
      mass: 2,
      tension: 225,
      friction: 30
    }
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
