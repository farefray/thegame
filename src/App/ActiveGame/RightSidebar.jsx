import React from 'react';
import { useStoreState } from 'easy-peasy';

function Sidebar() {
  const players = useStoreState((state) => state.app.players);

  return players.sort((a, b) => a.heath - b.health).map(player => {
    return (
      <div key={player.index}> {player.index} - {player.health} </div>
    );
  });
}

export default Sidebar;