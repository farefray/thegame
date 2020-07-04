import React from 'react';
import classNames from 'classnames';
import Card from './Deck/Card.jsx';
import { useStoreState } from '@/store/hooks';
import Deck from './Deck';

function Player({ isOpponent = false }) {
  const state = useStoreState((state) => state.player);
  const { hand, deckSize, discard } = state;

  const classes = classNames('player', {
    'm-opponent': isOpponent
  });

  if (isOpponent) {
    return <div className={classes}></div>
  }

  return (
    <div className={classes}>
      <div className="player-deck">
        <Deck cards={new Array(deckSize).fill({})} />
      </div>
      <div className="player-hand">
        {hand && hand.map((card, index) => <Card key={index} card={card} />)}
      </div>
      <div className="player-discard">
        <Deck cards={discard} />
      </div>
    </div>
  );
}

export default Player;
