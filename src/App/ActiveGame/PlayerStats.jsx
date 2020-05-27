import React from 'react';
import { Col } from 'rsuite';

function PlayerStats({ playerStats }) {
  return (<React.Fragment>
      <Col className="playerstats-health">
        {playerStats.health}
      </Col>
      <Col className="playerstats-gold">
        {playerStats.gold}
      </Col>
      <Col className="playerstats-units">
        {`${playerStats.unitsAmount} / ${playerStats.level}`}
      </Col>
      <Col className="playerstats-level">
        {playerStats.level}
      </Col>
      </React.Fragment>);
}

export default PlayerStats;
