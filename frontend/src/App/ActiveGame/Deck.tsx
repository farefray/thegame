import React from 'react';
import DeckSpring from './Deck/Deck.spring';


function Deck({size, cards}: {size?, cards?}) {
  if (!cards) {
    if (!size) {
      return <React.Fragment/>;
    }

    // hidden deck
    cards = new Array(size).fill({});
  }

  return <div className="deck">
    {DeckSpring(cards)}
  </div>
}

export default Deck;
