import React from 'react';
import classNames from 'classnames';
import { useStoreState } from '@/store/hooks';
import Deck from './Deck';
import PlayerHand from './Player/PlayerHand';

function Player({ isOpponent = false }) {
  const state = useStoreState((state) => state.player);
  const { hand, cardAction, deckSize, discard } = state;

  const classes = classNames('player', {
    'm-opponent': isOpponent
  });

  if (isOpponent) {
    return <div className={classes}></div>
  }

  console.log('====Player rerender======')

  return (
    <div className={classes}>
      <div className="player-deck">
        <Deck size={deckSize} />
      </div>
      <div className="player-hand">
        {hand.length > 0 && PlayerHand(hand, cardAction)}
      </div>
      {/* <div className="player-discard">
        <Deck cards={discard} />
      </div> */}
    </div>
  );
}

export default Player;
