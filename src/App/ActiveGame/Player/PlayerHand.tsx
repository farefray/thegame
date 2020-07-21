import React, { useRef, useEffect } from 'react';
import CardWrapper from '../Deck/Card';
import { Card } from '@/types/Card';

function PlayerHand({ hand = [] }: { hand: Card[] }) {
  const handsRef = useRef(hand);

  useEffect(() => {
    if (hand.length && !handsRef.current.length) {
      // added cards to hand
      handsRef.current = [...hand];
    }

  }, [hand]);

  return (
    <React.Fragment>
      {hand.map((card: Card) => {
        return <CardWrapper card={card} key={card.uuid} />;
      })}
    </React.Fragment>
  );
}

export default PlayerHand;
