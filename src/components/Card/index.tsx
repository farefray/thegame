import React from 'react';

// import CardSpring from './CardSpring'; // todo
import CardUnit from './CardUnit';
import CardInstant from './CardInstant';
import CardInner from './CardInner';
import CardVictory from './CardVictory';

function Card({ children }) {
  return <div className="card"><div className="card-frame frame">{children}</div></div>;
}

Card.Inner = CardInner;
Card.Instant = CardInstant;
Card.Unit = CardUnit;
Card.Victory = CardVictory;

const CardWrapper = ({ card, revealed = true }) => {
  return (
    <Card>
      {revealed && (
        <Card.Inner config={card}>
          {card.config.instant ? <Card.Instant config={card.config.instant}></Card.Instant> : null}
          {card.config.victory ? <Card.Victory config={card.config.victory}></Card.Victory> : null}
          {card.monster ? <Card.Unit monster={card.monster}></Card.Unit> : null}
        </Card.Inner>
        )}
    </Card>
  );
};

export default CardWrapper;
