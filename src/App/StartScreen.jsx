import React from 'react';
import { Container, Header, Content, Footer, Navbar, FlexboxGrid, Panel } from 'rsuite';
import Connecting from './StartScreen/Connecting';
import LoginForm from './StartScreen/LoginForm';
import Lobby from './StartScreen/Lobby';
import { useStoreState } from '@/store/hooks';

function StartScreen() {
  const isConnected = useStoreState((state) => state.app.isConnected);
  const isLoggedIn = useStoreState((state) => state.customer.isLoggedIn);

  return (
    <Container style={{ minHeight: '100vh' }}>
      <Header>
        <Navbar appearance="inverse">
          <Navbar.Header style={{ position: 'absolute' }}>
            <a className="navbar-brand logo" href="#?logo">
              GameLogo
            </a>
          </Navbar.Header>
          <Navbar.Body>
            <FlexboxGrid align="middle" justify="center">
              <FlexboxGrid.Item>
                <h2>GameName</h2>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Navbar.Body>
        </Navbar>
      </Header>
      <Content className="startscreen">
        <FlexboxGrid align="middle" justify="center" className="startscreen-flexbox">
          <FlexboxGrid.Item colspan={isLoggedIn ? 18 : 12}>
            <Panel header={<h3>{isLoggedIn ? 'Lobby' : 'Login'}</h3>} bordered>
              {!isConnected ? <Connecting className="startscreen-loading"></Connecting> : (isLoggedIn && <Lobby />) || <LoginForm />}
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Content>
      <Footer style={{ alignSelf: 'flex-end' }}>[demo] Copyrights (c) 2019 - 2020</Footer>
    </Container>
  );
}


export default StartScreen;
