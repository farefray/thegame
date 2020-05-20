import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { Container, Header, Content, Footer, Sidebar } from 'rsuite';

import Timer from './ActiveGame/Timer.jsx';
import PlayerStats from './ActiveGame/PlayerStats.jsx';
import GameBoardWrapper from './ActiveGame/GameBoardWrapper.jsx';

import RightSidebar from './ActiveGame/RightSidebar.jsx';
import LeftSidebar from './ActiveGame/LeftSidebar.jsx';
import Notification from './ActiveGame/Notification.jsx';

function ActiveGame() {
  const appState = useSelector(state => state.app, shallowEqual);
  const gameboardState = useSelector(state => state.gameboard, shallowEqual);
  const playerState = useSelector(state => state.player, shallowEqual);
  const { notification } = appState;
  return (
    <Container className="activegame">
      <Header className="gameheader">
        <PlayerStats playerStats={{ health: playerState.health, level: playerState.level, unitsAmount: gameboardState.myBoard.length, gold: playerState.gold }} />
        <Timer initialTimerValue={appState.countdown} />
        {notification && <Notification notificationObject={notification} />}
      </Header>
      <Container>
        <Sidebar>
          <LeftSidebar />
        </Sidebar>
        <Content>
          <GameBoardWrapper state={gameboardState} />
        </Content>
        <Sidebar width={448}>
          <RightSidebar shopUnits={playerState.shopUnits} />
        </Sidebar>
      </Container>
      <Footer></Footer>
    </Container>
  );
}

export default ActiveGame;
