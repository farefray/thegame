import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Header, Content, Footer, Navbar, FlexboxGrid, Panel } from 'rsuite';
import Connecting from './StartScreen/Connecting';
import LoginForm from './StartScreen/LoginForm';
import Lobby from './StartScreen/Lobby';

class StartScreen extends Component {
  constructor(props) {
    super(props);
  }

  // TODO wait for unitJSON appear in localstorage before rendeing
  render() {
    const { isConnected, isLoggedIn } = this.props;

    return (
      <Container style={{ minHeight: '100vh' }}>
        <Header>
          <Navbar appearance="inverse">
            <Navbar.Header style={{ position: 'absolute' }}>
              <a className="navbar-brand logo">GameLogo</a>
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
            <FlexboxGrid.Item colspan={12}>
              <Panel header={<h3>Login</h3>} bordered>
                {!isConnected ? (
                  <Connecting className="startscreen-loading"></Connecting>
                ) : (
                  isLoggedIn
                  && <Lobby /> 
                  || <LoginForm />
                )}
              </Panel>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Content>
        <Footer style={{ alignSelf: 'flex-end' }}>Copyrights (c) 2019</Footer>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  const { isConnected } = state.startscreen;
  const { isLoggedIn } = state.customer;
  return {
    isConnected,
    isLoggedIn
  };
}

const connected = connect(mapStateToProps)(StartScreen);
export default connected;
