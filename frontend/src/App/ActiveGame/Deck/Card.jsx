import React from 'react';
import CardSpring from './CardSpring';
import CardInner from '../Card/CardInner';

function Card({ card, animated = false, revealed = true }) {
  const cardEl = (
    <div className="card">
            <div className="card-frame frame">{revealed && <CardInner card={card} />}</div>
          </div>
  );

  if (animated) {
    return CardSpring(cardEl);
  }

  return cardEl;
}

export default Card;
