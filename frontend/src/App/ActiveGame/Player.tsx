import React from 'react';
import classNames from 'classnames';
import Card from './Merchantry/Card.jsx';
import { useStoreState } from '@/store/hooks';

function Player({ isOpponent = false }) {
  const state = useStoreState((state) => state.player);
  console.log("Player -> state", state)
  const { hand, deckSize, discard } = state;

  const classes = classNames('player', {
    'm-opponent': isOpponent
  });

  return (
    <div className={classes}>
      Deck size: {deckSize}
      {' '}
      My hand:
      {hand && hand.map((card, index) => <Card key={index} card={card} />)}
      Discard: {discard.length}
    </div>
  );
}

export default Player;
