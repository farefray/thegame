import React from 'react';

import { Grid, Row, Col } from 'rsuite';
import { useStoreState } from 'easy-peasy';

// import Timer from './ActiveGame/Timer.jsx';
// import PlayerStats from './ActiveGame/PlayerStats.jsx';
import BattleBoardWrapper from './ActiveGame/BattleBoardWrapper.jsx';

import Merchantry from './ActiveGame/Merchantry.jsx';
import PlayerBoardWrapper from './ActiveGame/PlayerBoardWrapper.jsx';
import Player from './ActiveGame/Player';
import Timer from './ActiveGame/Timer.jsx';

function ActiveGame() {
  const isActiveBattleGoing = useStoreState((state) => state.gameboard.isActiveBattleGoing);

  const countdown = useStoreState((state) => state.app.countdown);

  return (
    <Grid fluid>
      <Row>
        <Player isOpponent={true}/>
      </Row>
      <Row className="arena">
        <Col>
          <div className="gameboard">
          <div className="gameboard-background"></div>
            <div className="gameboard-wrapper">
              {isActiveBattleGoing ? <BattleBoardWrapper /> : <PlayerBoardWrapper />}
            </div>
          </div>
          <Timer initialTimerValue={countdown}/>
        </Col>
        <Col>
          <Merchantry />
        </Col>
      </Row>
      <Row>
        <Player />
      </Row>
    </Grid>
  );
}

export default ActiveGame;
