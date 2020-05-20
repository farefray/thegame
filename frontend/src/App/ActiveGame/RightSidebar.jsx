import React from 'react';

function Sidebar({players}) {
  return players.sort((a, b) => a.heath - b.health).map(player => {
    return (
      <div> Player: {player.index}. HP: {player.health} </div>
    );
  });
}

export default Sidebar;