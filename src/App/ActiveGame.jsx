import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { Grid, Row, Col, Sidenav } from 'rsuite';

import Timer from './ActiveGame/Timer.jsx';
import PlayerStats from './ActiveGame/PlayerStats.jsx';
import BattleBoardWrapper from './ActiveGame/BattleBoardWrapper.jsx';

import RightSidebar from './ActiveGame/RightSidebar.jsx';
import UnitShop from './ActiveGame/UnitShop.jsx';
import Notification from './ActiveGame/Notification.jsx';
import PlayerBoardWrapper from './ActiveGame/PlayerBoardWrapper.jsx';
import PlayerHand from './ActiveGame/PlayerHand.jsx';

function ActiveGame() {
  const appState = useSelector((state) => state.app, shallowEqual);
  const gameboardState = useSelector((state) => state.gameboard, shallowEqual);
  const playerState = useSelector((state) => state.player, shallowEqual);
  const { notification, countdown, players } = appState;
  return (
    <Grid fluid>
      <Row className="gameheader">
        <Col xs={24} sm={24} md={16} lg={12}>
          {notification && <Notification notificationObject={notification} />}
          <Row className="playerstats">
            <PlayerStats playerStats={{ health: playerState.health, level: playerState.level, unitsAmount: playerState.boardUnits.length, gold: playerState.gold }} />
            <Timer initialTimerValue={countdown} />
          </Row>
        </Col>
      </Row>

      <Row className="gamecontainer">
        <Sidenav defaultOpenKeys={['3', '4']}>
          <Sidenav.Body>
            <UnitShop shopUnits={playerState.shopUnits} />
          </Sidenav.Body>
        </Sidenav>

        <Col xsPull={24} className="gameboard-wrapper">
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

        <Col xs={6} xsPush={12}>
          <RightSidebar players={players} />
        </Col>
      </Row>
    </Grid>
  );
}

export default ActiveGame;
