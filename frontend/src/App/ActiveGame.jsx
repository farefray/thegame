import React from 'react';

import { Grid, Row, Col } from 'rsuite';
import { useStoreState } from 'easy-peasy';

// import Timer from './ActiveGame/Timer.jsx';
// import PlayerStats from './ActiveGame/PlayerStats.jsx';
import BattleBoardWrapper from './ActiveGame/BattleBoardWrapper.jsx';

import Merchantry from './ActiveGame/Merchantry.jsx';
import PlayerBoardWrapper from './ActiveGame/PlayerBoardWrapper.jsx';
import Player from './ActiveGame/Player.jsx';

function ActiveGame() {
  const isActiveBattleGoing = useStoreState((state) => state.gameboard.isActiveBattleGoing);
  const playerState = useStoreState((state) => state.player);
  // const countdown = useStoreState((state) => state.app.countdown);

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
              {isActiveBattleGoing ? <BattleBoardWrapper /> : <PlayerBoardWrapper boardUnits={playerState.board} />}
            </div>
          </div>
        </Col>
        <Col>
          <Merchantry />
        </Col>
      </Row>
      <Row>
        <Player player={playerState}/>
      </Row>
    </Grid>
  );
}

export default ActiveGame;
