import React from 'react';
import DeckSpring from './Deck/Deck.spring';


function Deck({ cards }) {
  return <div className="deck">
    {DeckSpring(cards)}
  </div>
}

export default Deck;
