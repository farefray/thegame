import React, { useState, useEffect } from 'react';
import { useStoreState } from '@/store/hooks';
import Deck from './Deck';
import PlayerHand from './Player/PlayerHand';
import Healthbar from './Player/Healthbar';
import Gold from './Player/Gold';

function Player({ isOpponent }) {
  const currentPlayer = useStoreState((state) => state.players.currentPlayer);
  const opponent = useStoreState((state) => state.players.opponent);
  const player = isOpponent ? opponent : currentPlayer;

  return (
    <div className={"player " + (isOpponent ? 'm-opponent' : '')}>
      <Healthbar health={player.health} />
      <Gold gold={player.gold}/>
      <div className="player-deck">
        {player.deck ? <Deck cards={player.deck} /> : <></>}
      </div>
      <div className="player-hand">
        {player.hand ? <PlayerHand cards={player.hand} /> : <></>}
      </div>
      {/*
      <div className="player-discard">
        <Deck cards={player.discard} />
      </div> */}
    </div>
  );
}

export default Player;
