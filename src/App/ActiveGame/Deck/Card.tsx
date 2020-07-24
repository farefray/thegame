import React from 'react';

// import CardSpring from './CardSpring'; // todo
import CardUnit from '../Card/CardUnit';
import CardInstant from '../Card/CardInstant';
import CardInner from '../Card/CardInner';
import CardVictory from '../Card/CardVictory';

// const animateCardAction = (cardAction, index?) => (i) => {
//   const cardWidth = 32 * 4;
//   if (!cardAction) {
//     return {
//       x: 0,
//       y: 0,
//       scale: 1,
//       op: 1,
//       delay: 50 + i * 100,
//       from: {
//         x: -cardWidth * i,
//         y: 0,
//         scale: 1,
//         op: 0
//       }
//     };
//   }

//   return index === i ? { x:0, y: -(i * 100), scale: 1.25, op: 0 } : { x:0, y: 0, scale: 1, op: 1 };
// };

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
        <Card.Inner config={card}>
          {card.config.instant ? <Card.Instant config={card.config.instant}></Card.Instant> : null}
          {card.monster ? <Card.Unit monster={card.monster}></Card.Unit> : null}
          {card.config.victory ? <Card.Victory config={card.config.victory}></Card.Victory> : null}
        </Card.Inner>
      )}
    </Card>
  );
};

export default CardWrapper;
