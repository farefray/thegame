import React from 'react';

import CardSpring from './CardSpring';
import CardUnit from './CardUnit';
import CardInner from './CardInner';
import CardEffects from './CardEffects';

function Card({ children }) {
  return (
    <div className="card">
      <div className="card-frame frame">{children}</div>
    </div>
  );
}

Card.Spring = CardSpring;
Card.Inner = CardInner;
Card.Effects = CardEffects;
Card.Unit = CardUnit;

const CardWrapper = ({ card, revealed = true }) => {
  return (
    <Card.Spring>
      <Card>
        {revealed && (
          <Card.Inner config={card}>
            {card.config.instant ? <Card.Effects config={card.config.instant} modifiers={['m-instant']} /> : null}
            <div className="card-divider"/>
            {card.config.victory ? <Card.Effects config={card.config.victory} modifiers={['m-victory']} /> : null}
            {card.monster ? <Card.Unit monster={card.monster}></Card.Unit> : null}
          </Card.Inner>
        )}
      </Card>
    </Card.Spring>
  );
};

export default CardWrapper;
