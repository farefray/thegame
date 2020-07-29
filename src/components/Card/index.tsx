import React from 'react';

import CardAnimation, { IAnimationProps } from './CardAnimation';
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

Card.Animation = CardAnimation;
Card.Inner = CardInner;
Card.Effects = CardEffects;
Card.Unit = CardUnit;

const CardComponent = ({ card, revealed = true}) => {
  return (
      <Card>
        {revealed && (
          <Card.Inner config={card}>
            {card.config.instant ? <Card.Effects config={card.config.instant} modifiers={['m-instant']} /> : null}
            <div className="card-divider" />
            {card.config.victory ? <Card.Effects config={card.config.victory} modifiers={['m-victory']} /> : null}
            {card.monster ? <Card.Unit monster={card.monster}></Card.Unit> : null}
          </Card.Inner>
        )}
      </Card>
  );
};

export default CardComponent;
