import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Content, Footer, Navbar, FlexboxGrid, Panel } from 'rsuite';
import Connecting from './StartScreen/Connecting';
import LoginForm from './StartScreen/LoginForm';
import Lobby from './StartScreen/Lobby';

class StartScreen extends Component {
  render() {
    const { isConnected, isReady, customer } = this.props;

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
            <FlexboxGrid.Item colspan={customer.isLoggedIn ? 18 : 12}>
              <Panel header={<h3>{customer.isLoggedIn ? 'Lobby' : 'Login'}</h3>} bordered>
                {!isConnected ? <Connecting className="startscreen-loading"></Connecting> : (customer.isLoggedIn && <Lobby customer={customer} isReady={isReady} />) || <LoginForm />}
              </Panel>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Content>
        <Footer style={{ alignSelf: 'flex-end' }}>[demo] Copyrights (c) 2019 - 2020</Footer>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  const { isConnected, isReady } = state.startscreen;
  return {
    isConnected,
    customer: state.customer,
    isReady
  };
}

const connected = connect(mapStateToProps)(StartScreen);
export default connected;
