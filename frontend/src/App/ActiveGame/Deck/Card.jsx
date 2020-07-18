import React from 'react';

// import CardSpring from './CardSpring'; // todo
import CardUnit from '../Card/CardUnit';
import CardInstant from '../Card/CardInstant';
import CardInner from '../Card/CardInner';
import CardVictory from '../Card/CardVictory';

function Card({ children }) {
  return (
    <div className="card">
      <div className="card-frame frame">{children}</div>
    </div>
  );
}

Card.Inner = CardInner;
Card.Instant = CardInstant;
Card.Unit = CardUnit;
Card.Victory = CardVictory;

const CardWrapper = ({ card, revealed = true }) => {
  return (
    <Card>
      {revealed && (
        <Card.Inner name={card.name} cost={card.cost}>
          {card.config.instant ? <Card.Instant config={card.config.instant}></Card.Instant> : null}
          {card.monster ? <Card.Unit monster={card.monster}></Card.Unit> : null}
          {card.config.victory ? <Card.Victory config={card.config.victory}></Card.Victory> : null}
        </Card.Inner>
      )}
    </Card>
  );
};

export default CardWrapper;
