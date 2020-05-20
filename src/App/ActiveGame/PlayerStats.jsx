import React from 'react';

function PlayerStats({ playerStats }) {
  return (
    <div className="player">
      <div className="player-data">
        <div className="player-data__hp"></div>
        <div className="player-data__value">{playerStats.health}</div>
      </div>
      <div className="player-data">
        <div className="player-data__coin"></div>
        <div className="player-data__value">{playerStats.gold}</div>
      </div>
      <div className="player-data">
        <div className="player-data__level"></div>
        <div className="player-data__value">{`${playerStats.unitsAmount} / ${playerStats.level}`}</div>
      </div>
    </div>
  );
}

export default PlayerStats;
