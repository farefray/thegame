import React, { useState, useEffect } from 'react';
import { useStoreState } from '@/store/hooks';
import Deck from './Deck';
import PlayerHand from './Player/PlayerHand';
import Healthbar from './Player/Healthbar';

function Player({ isOpponent }) {
  const currentPlayer = useStoreState((state) => state.players.currentPlayer);
  const opponent = useStoreState((state) => state.players.opponent);
  const player = isOpponent ? opponent : currentPlayer;

  return (
    <div className={"player " + (isOpponent ? 'm-opponent' : '')}>
      <Healthbar health={player.health} />
      <div className="player-deck">
        {player.deck ? <Deck cards={player.deck} isDiscard={false} /> : <></>}
      </div>
      <div className="player-hand">
        {player.hand ? <PlayerHand cards={player.hand} isOpponent={isOpponent} /> : <></>}
      </div>
      <div className="player-discard">
        {player.discard ? <Deck cards={player.discard} isDiscard={true} /> : <></>}
      </div>
    </div>
  );
}

export default Player;
