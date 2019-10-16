import React from 'react';

function PlayerStats({playerInfo}) {
  return <div className="player">
    <div className="player-data">
        <div className="player-data__hp"></div>
        <div className="player-data__value">{playerInfo.hp}</div>    
    </div>
    <div className="player-data">
        <div className="player-data__coin"></div>
        <div className="player-data__value">{playerInfo.gold}</div>
    </div>
    <div className="player-data">
        <div className="player-data__mana"></div>
        <div className="player-data__value">{playerInfo.mana}</div>
    </div>
  </div>;
}

export default PlayerStats;