import React, { useRef, useEffect } from 'react';
import Card from '@/components/Card';
import { TCard } from '@/types/Card';

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
      {hand.map((card: TCard) => {
        return <Card card={card} key={card.uuid} />;
      })}
    </React.Fragment>
  );
}

export default PlayerHand;
