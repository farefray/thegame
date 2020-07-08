import React from 'react';
import classNames from 'classnames';
import { useStoreState } from '@/store/hooks';
import Deck from './Deck';
import PlayerHand from './Player/PlayerHand';

function Player({ isOpponent = false }) {
  const state = useStoreState((state) => state.player);
  const { hand, cardAction, deckSize, discard } = state;
  console.log("Player -> cardAction", cardAction)
  console.log("Player -> hand", hand)

  const classes = classNames('player', {
    'm-opponent': isOpponent
  });

  if (isOpponent) {
    return <div className={classes}></div>
  }

  return (
    <div className={classes}>
      <div className="player-deck">
        <Deck size={deckSize} />
      </div>
      <div className="player-hand">
        {hand.length > 0 ? (<PlayerHand hand={hand} cardAction={cardAction}/>): ''}
      </div>
      {/* <div className="player-discard">
        <Deck cards={discard} />
      </div> */}
    </div>
  );
}

export default Player;
