import React from 'react';
import Timer from './Timer.jsx';

function PlayerResources({value}) {
  return <div className="player-resources">
    <div className="player-resources-block">
        <div className="player-resources-hp-img"></div>
        <div className="player-resources-number">100</div>    
    </div>
    <div className="player-resources-block">
        <div className="player-resources-coin-img"></div>
        <div className="player-resources-number">{value.gold}</div>
    </div>
    <div className="player-resources-block">
        <div className="player-resources-mana-img"></div>
        <div className="player-resources-number">99</div>
    </div>
    <div className="player-resources-block">
    <Timer value={value.countdown} />
    </div>
  </div>;
}

export default PlayerResources;