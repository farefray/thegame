import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { startGame, ready, unready } from '../socket';
import { Container, Header, Content, Footer, Loader, Navbar, FlexboxGrid, Panel, Form, Button, FormGroup, ControlLabel, ButtonToolbar, FormControl } from 'rsuite';
import Connecting from './StartScreen/Connecting.jsx';

class StartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nameChangeInput: ''
    };
  }

  handleNameChange = event => {
    if (this.state.nameChangeInput.length <= 20 && this.state.nameChangeInput !== '') {
      this.props.dispatch({ type: 'UPDATE_PRIVATE_NAME', name: this.state.nameChangeInput });
    }

    this.setState({ ...this.state, nameChangeInput: '' });
    event.preventDefault();
  };

  toggleReady = () => {
    console.log('@toggleReady', this.props.ready);
    const { dispatch } = this.props;
    dispatch({ type: 'TOGGLE_READY' });
    this.props.ready ? unready() : ready();
  };

  startGameEvent = () => {
    console.log('@startGameEvent');
    if (this.props.allReady) {
      console.log('Starting');
      startGame();
    } else {
      console.log('Not starting');
    }
  };

  // TODO wait for unitJSON appear in localstorage before rendeing
  render() {
    const { connected: isConnected } = this.props;
    const test = (
      <div id="startscreen">
          <div>
            {this.props.playerName !== '' ? (
              <div>
                Player: {this.props.playerName} <br />
                <button className={`rpgui-button startButton ${!this.props.ready ? 'growAnimation' : ''}`} onClick={this.toggleReady}>
                  <p>{this.props.ready ? 'Unready' : 'Ready'}</p>
                </button>
                <button
                  style={{ marginLeft: '5px' }}
                  className={`rpgui-button ${this.props.playersReady === this.props.connectedPlayers ? 'growAnimation' : ''}`}
                  onClick={() => this.startGameEvent()}
                >
                  <p>{`Start Game (${this.props.playersReady}/${this.props.connectedPlayers})`}</p>
                </button>
              </div>
            ) : (
              <div>
                <form>
                  <label className="text_shadow">Name:</label>
                  <label>
                    <input
                      maxLength="20"
                      placeholder="Enter your nickname"
                      className="textInputSmaller"
                      type="text"
                      value={this.state.nameChangeInput}
                      onChange={event => this.setState({ ...this.state, nameChangeInput: event.target.value })}
                    />
                  </label>
                  <button className="rpgui-button golden" type="button" onClick={this.handleNameChange}>
                    <p>Submit</p>
                  </button>
                </form>
              </div>
            )}
          </div>
      </div>
    );

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
                {isConnected ? (
                  <Connecting className="startscreen-loading"></Connecting>
                ) : (
                  <Form fluid>
                  <div className="test"></div>
                    <FormGroup className="ic_user">
                      <ControlLabel>Email/Username</ControlLabel>
                      <FormControl name="name" />
                    </FormGroup>
                    <FormGroup className="ic_pw">
                      <ControlLabel>Password</ControlLabel>
                      <FormControl name="password" type="password"/>
                    </FormGroup>
                    <FormGroup>
                      <ButtonToolbar>
                        <Button appearance="primary">Sign in</Button>
                        <Button appearance="link">Forgot password?</Button>
                      </ButtonToolbar>
                    </FormGroup>
                  </Form>
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
const mapDispatchToProps = dispatch => bindActionCreators(dispatch);
function mapStateToProps(state) {
  const { ready, playersReady, connectedPlayers, connected, loadedUnitJson, loadingCounter, playerName } = state.startscreen;

  const { allReady } = state.app;
  return {
    ready,
    allReady,
    playersReady,
    connected,
    connectedPlayers,
    loadedUnitJson,
    loadingCounter,
    playerName
  };
}

const connected = connect(mapStateToProps)(StartScreen);
const withDispatch = connect(mapDispatchToProps)(connected);
export default withDispatch;
