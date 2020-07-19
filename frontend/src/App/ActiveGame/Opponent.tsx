import React from 'react';
import { useStoreState } from '@/store/hooks';
import Deck from './Deck';
import PlayerHand from './Player/PlayerHand';
import Healthbar from './Player/Healthbar';
import Gold from './Player/Gold';

function Player() {
  const opponent = useStoreState((state) => state.opponent);

  return (
    <div className="player m-opponent">
      <Healthbar health={opponent.health} />
      <Gold gold={opponent.gold}/>
      <div className="player-deck">
        <Deck size={opponent.deckSize} />
      </div>
      <div className="player-hand">
        <PlayerHand hand={opponent.hand} />
      </div>
      <div className="player-discard">
        <Deck cards={opponent.discard} />
      </div>
    </div>
  );
}

export default Player;
