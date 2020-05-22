import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { Container, Header, Content, Footer, Sidebar } from 'rsuite';

import Timer from './ActiveGame/Timer.jsx';
import PlayerStats from './ActiveGame/PlayerStats.jsx';
import BattleBoardWrapper from './ActiveGame/BattleBoardWrapper.jsx';

import RightSidebar from './ActiveGame/RightSidebar.jsx';
import LeftSidebar from './ActiveGame/LeftSidebar.jsx';
import Notification from './ActiveGame/Notification.jsx';
import PlayerBoardWrapper from './ActiveGame/PlayerBoardWrapper.jsx';
import PlayerHand from './ActiveGame/PlayerHand.jsx';

function ActiveGame() {
  const appState = useSelector((state) => state.app, shallowEqual);
  const gameboardState = useSelector((state) => state.gameboard, shallowEqual);
  const playerState = useSelector((state) => state.player, shallowEqual);
  const { notification } = appState;
  return (
    <Container className="activegame">
      <Header className="gameheader">
        <PlayerStats playerStats={{ health: playerState.health, level: playerState.level, unitsAmount: playerState.boardUnits.length, gold: playerState.gold }} />
        <Timer initialTimerValue={appState.countdown} />
        {notification && <Notification notificationObject={notification} />}
      </Header>
      <Container>
        <Sidebar>
          <LeftSidebar shopUnits={playerState.shopUnits} />
        </Sidebar>
        <Content>
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
        </Content>
        <Sidebar>
          <RightSidebar players={appState.players} />
        </Sidebar>
      </Container>
      <Footer></Footer>
    </Container>
  );
}

export default ActiveGame;
