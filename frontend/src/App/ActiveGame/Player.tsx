import React from 'react';
import classNames from 'classnames';
import { useStoreState } from '@/store/hooks';
import Deck from './Deck';
import PlayerHand from './Player/PlayerHand';
import Healthbar from './Player/Healthbar';
import Gold from './Player/Gold';

function Player({ isOpponent = false }) {
  const player = useStoreState((state) => state.player);
  const { hand, deckSize/*, discard*/ } = player;

  const classes = classNames('player', {
    'm-opponent': isOpponent
  });

  if (isOpponent) {
    return <div className={classes}></div>
  }

  return (
    <div className={classes}>
      <Healthbar health={player.health} />
      <Gold gold={player.gold}/>
      <div className="player-deck">
        <Deck size={deckSize} />
      </div>
      <div className="player-hand">
        <PlayerHand hand={hand} />
      </div>
      {/* <div className="player-discard">
        <Deck cards={discard} />
      </div> */}
    </div>
  );
}

export default Player;
