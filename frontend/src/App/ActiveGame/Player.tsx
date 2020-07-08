import React from 'react';
import classNames from 'classnames';
import { useStoreState } from '@/store/hooks';
import Deck from './Deck';
import PlayerHand from './Player/PlayerHand';
import Healthbar from './Player/Healthbar';

function Player({ isOpponent = false }) {
  const player = useStoreState((state) => state.player);
  const { hand, cardAction, deckSize, discard } = player;

  const classes = classNames('player', {
    'm-opponent': isOpponent
  });

  if (isOpponent) {
    return <div className={classes}></div>
  }

  return (
    <div className={classes}>
      <div className="player-health">
        <Healthbar health={player.health}/>
      </div>
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
