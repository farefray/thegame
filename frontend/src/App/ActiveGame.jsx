import React from 'react';

import { Grid, Row, Col, Sidenav, Nav, Sidebar } from 'rsuite';
import { useStoreState } from 'easy-peasy';

import Timer from './ActiveGame/Timer.jsx';
import PlayerStats from './ActiveGame/PlayerStats.jsx';
import BattleBoardWrapper from './ActiveGame/BattleBoardWrapper.jsx';

import RightSidebar from './ActiveGame/RightSidebar.jsx';
import Merchantry from './ActiveGame/Merchantry.jsx';
import PlayerBoardWrapper from './ActiveGame/PlayerBoardWrapper.jsx';
import PlayerHand from './ActiveGame/PlayerHand.jsx';

function ActiveGame() {
  const isActiveBattleGoing = useStoreState((state) => state.gameboard.isActiveBattleGoing);
  const playerState = useStoreState((state) => state.player);
  const countdown = useStoreState((state) => state.app.countdown);

  return (
    <Grid fluid>
      <Row className="gameheader">
        <Col>
          <Row className="playerstats">
            <PlayerStats playerStats={{ health: playerState.health, level: 1 /** TODO? */, unitsAmount: playerState.board.length, gold: playerState.gold }} />
            <Timer initialTimerValue={countdown} />
          </Row>
        </Col>
        <Col>
          <Row>
            <Merchantry />
          </Row>
        </Col>
      </Row>

      <Row className="gamecontainer">
        <Col xs={24} sm={24} md={12}>
          <div className="gameboard">
            <div className="gameboard-background"></div>
            <div className="gameboard-wrapper">
              {isActiveBattleGoing ? <BattleBoardWrapper /> : <PlayerBoardWrapper boardUnits={playerState.board} />}
            </div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <div>
            Discard cards: {playerState.discard.length} <br />
            My deck cards: {playerState.deck.length} <br />
            My hand cards: {playerState.hand.length} <br />
            <PlayerHand hand={playerState.hand} />
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
        <RightSidebar />
        </Col>
      </Row>
    </Grid>
  );
}

export default ActiveGame;
