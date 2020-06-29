import React from 'react';
import { Col } from 'rsuite';

function PlayerStats({ playerStats }) {
  return (
    <React.Fragment>
      <Col xs={12} sm={6} md={6} lg={4}>
        <div className="playerstats-frame playerstats-frame__health">{playerStats.health}</div>
      </Col>
      <Col xs={12} sm={6} md={6} lg={4}>
        <div className="playerstats-frame playerstats-frame__gold">{playerStats.gold}</div>
      </Col>
      {/* <Col xs={12} sm={6} md={6} lg={4}>
        <div className="playerstats-frame playerstats-frame__units">{`? / ?`}</div>
      </Col>
      <Col xs={12} sm={6} md={6} lg={4}>
        <div className="playerstats-frame playerstats-frame__level">?</div>
      </Col> */}
    </React.Fragment>
  );
}

export default PlayerStats;
