import React, { useRef, useEffect } from 'react';
import CardComponent from 'components/Card';
import { Card } from '@/types/Card';

function PlayerHand({ hand = [] }: { hand: Card[]}) {
  const handsRef = useRef(hand);

  useEffect(() => {
    if (hand.length && !handsRef.current.length) {
      // added cards to hand
      handsRef.current = [...hand];
    }

  }, [hand]);

  return (
    <React.Fragment>
      {hand.map((card: any) => {
        return <CardComponent card={card} revealed={true}/>;
      })}
    </React.Fragment>
  );
}

export default PlayerHand;
