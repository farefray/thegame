import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { startGame, ready, unready } from '../socket';

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
    const { connected:isConnected } = this.props;

    return (
      <div id="startscreen">
        {isConnected ? (
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
        ) : <div className="startscreen-loading">isLoading</div>
        }
      </div>
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
