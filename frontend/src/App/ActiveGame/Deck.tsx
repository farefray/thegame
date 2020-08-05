import React, { useState, useEffect } from 'react';
import CardComponent from 'components/Card/CardComponent';
import { useTransition, a } from 'react-spring';
import { CARD_WIDTH } from '@/types/Card.d.ts';
import { getRandomArbitrary } from '@/utils/misc';

const DeckWrapper = (children) => <div className="deck">{children}</div>;

function Deck({ cards, isDiscard }) {
  const [deckState, updateState] = useState(cards);

  useEffect(() => {
    updateState(cards);
  }, [cards]);

  const transition = useTransition(deckState, {
    keys: (cards) => cards.uuid,
    from: (card, i) => ({
      x: 0,
      y: isDiscard ? 0 : -500,
      // opacity: 0
    }),
    enter: (card, i) => ({
      x: 0,
      y: -i * getRandomArbitrary(2, 6),
      // opacity: 1, // currently bugged in react-spring
      rotate: getRandomArbitrary(-5, 5),
      delay: 250 * i
    }),
    leave: (card, i) => {
      return {
        x: 24 + i * CARD_WIDTH,
        y: 0,
        // opacity: 0
      };
    },
    config: {
      mass: 2,
      tension: 225,
      friction: 30
    }
  });

  const fragment = transition((style, card, t, i) => (
    <a.div style={style}>
      <CardComponent card={card} revealed={!!card.name} />
    </a.div>
  ));

  return DeckWrapper(fragment);
}

export default Deck;
