import React from 'react';
import Card from '../Deck/Card';

function PlayerHand({ hand }) {
  return <React.Fragment>{hand && hand.map((card, index) => <Card key={index} card={card} />)}</React.Fragment>;
}

export default PlayerHand;
