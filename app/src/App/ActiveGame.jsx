import React, { useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { Container, Header, Content, Footer, Sidebar } from 'rsuite';

import Timer from './ActiveGame/Timer.jsx';
import PlayerStats from './ActiveGame/PlayerStats.jsx';
import GameBoardWrapper from './ActiveGame/GameBoardWrapper.jsx';

import RightSidebar from './ActiveGame/RightSidebar.jsx';
import LeftSidebar from './ActiveGame/LeftSidebar.jsx';


function ActiveGame() {
  useEffect(() => {
    console.log('ACTIVE GAME MOUNT');
  }, []);

  const appState = useSelector(state => state.app, shallowEqual);
  const gameboardState = useSelector(state => state.gameboard, shallowEqual);
  return (
    <Container className="activegame">
      <Header className="gameheader">
        <PlayerStats playerInfo={{ health: appState.hp, mana: appState.mana, gold: appState.gold }} />
        <Timer initialTimerValue={appState.countdown} />
      </Header>
      <Container>
        <Sidebar>
          <LeftSidebar />
        </Sidebar>
        <Content>
          <GameBoardWrapper state={gameboardState}/>
        </Content>
        <Sidebar width={520}>
          <RightSidebar shopUnits={appState.shopUnits}/>
        </Sidebar>
      </Container>
      <Footer></Footer>
    </Container>
  );
}

export default ActiveGame;
