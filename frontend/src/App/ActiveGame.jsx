import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { Grid, Row, Col, Sidenav, Nav, Sidebar } from 'rsuite';

import Timer from './ActiveGame/Timer.jsx';
import PlayerStats from './ActiveGame/PlayerStats.jsx';
import BattleBoardWrapper from './ActiveGame/BattleBoardWrapper.jsx';

import RightSidebar from './ActiveGame/RightSidebar.jsx';
import Merchantry from './ActiveGame/Merchantry.jsx';
import PlayerBoardWrapper from './ActiveGame/PlayerBoardWrapper.jsx';
import PlayerHand from './ActiveGame/PlayerHand.jsx';

function ActiveGame() {
  const appState = useSelector((state) => state.app, shallowEqual);
  const gameboardState = useSelector((state) => state.gameboard, shallowEqual);
  const playerState = useSelector((state) => state.player, shallowEqual);
  const { countdown, players } = appState;

  return (
    <Grid fluid>
      <Row className="gameheader">
        <Col>
          <Row className="playerstats">
            <PlayerStats playerStats={{ health: playerState.health, level: playerState.level, unitsAmount: playerState.boardUnits.length, gold: playerState.gold }} />
            <Timer initialTimerValue={countdown} />
          </Row>
        </Col>
      </Row>

      <Row className="gamecontainer">
        <Col xs={24} sm={6} md={6} lg={6} smPush={14} lgPush={0}>
          <Sidebar
            width={260}
          >
            <Sidenav expanded={true} appearance="subtle" >
              <Sidenav.Body>
                <Nav>
                  <Merchantry />
                </Nav>
              </Sidenav.Body>
            </Sidenav>
          </Sidebar>
        </Col>

        <Col xs={24} sm={14} md={12} lg={12} smPull={6} lgPull={0}>
          <div className="gameboard">
            <div className="gameboard-background"></div>
            <div className="gameboard-wrapper">
              {gameboardState.isActiveBattleGoing ? <BattleBoardWrapper gameboardState={gameboardState} /> : <PlayerBoardWrapper boardUnits={playerState.boardUnits} />}
            </div>
          </div>
          <div className="gameboard">
            <div className="playerHand">
              <PlayerHand handUnits={playerState.handUnits} />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={24} md={6} lg={6}>
          <RightSidebar players={players} />
        </Col>
      </Row>
    </Grid>
  );
}

export default ActiveGame;
