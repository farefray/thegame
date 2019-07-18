import React, { Component } from 'react';
import { startGame, ready, unready } from '../socket';
import ProgressBar from '../components/ProgressBar.jsx';
import SoundButton from './StartScreen/SoundButton.jsx';

class StartScreen extends Component {

  constructor (props) {
    super(props);
    this.state = {
      'nameChangeInput': ''
    };
  }

  handleNameChange = (event) => {
    if (this.state.nameChangeInput.length <= 20 && this.state.nameChangeInput !== '') {
      this.props.dispatch({ type: 'UPDATE_PRIVATE_NAME', name: this.state.nameChangeInput });
    }

    this.setState({ ...this.state, 'nameChangeInput': '' })
    event.preventDefault();
  }

  toggleReady = () => {
    console.log('@toggleReady', this.props.ready);
    const { dispatch } = this.props;
    dispatch({ type: 'TOGGLE_READY' });
    this.props.ready ? unready() : ready();
  };

  startGameEvent = (forceStart = false) => {
    console.log('@startGameEvent', forceStart)
    if (this.props.allReady || forceStart) {
      console.log('Starting')
      startGame(this.props.playersReady);
    } else {
      console.log('Not starting')
    }
  }

  render () {
    const loadingProgress = 100 / 3 * (this.props.connected + this.props.loaded + (this.props.playersReady !== -1)) + 1;

    const isLoaded = (loadingProgress >= 100);

    const mainMenu = (<div>
      <div className='startButtons'>
        {isLoaded ?
          <div>
            {this.props.playerName !== '' ? <div>
              Player: {this.props.playerName} <br />
              <button className={`rpgui-button startButton ${(!this.props.ready ? 'growAnimation' : '')}`}
                onClick={this.toggleReady}><p>{(this.props.ready ? 'Unready' : 'Ready')}</p></button>
              <button style={{ marginLeft: '5px' }} className={`rpgui-button ${(this.props.playersReady === this.props.connectedPlayers ? 'growAnimation' : '')}`}
                onClick={() => this.startGameEvent()}>
                <p>
                  {(`Start Game (${this.props.playersReady}/${this.props.connectedPlayers})`)}
                </p>
              </button></div> : <div>
                <form>
                  <label className='text_shadow'>Name:</label>
                  <label>
                    <input maxLength='20' placeholder='Enter your nickname' className='textInputSmaller' type="text" value={this.state.nameChangeInput}
                      onChange={(event) => this.setState({ ...this.state, nameChangeInput: event.target.value })} />
                  </label>
                  <button className="rpgui-button golden" type="button" onClick={this.handleNameChange}><p>Submit</p></button>
                </form>
              </div>}
          </div> : <ProgressBar progress={loadingProgress} loadingCounter={this.state.loadingCounter} dispatch={this.props.dispatch} />}
      </div>

      <SoundButton soundEnabled={this.state.soundEnabled} musicEnabled={this.state.musicEnabled} dispatch={this.props.dispatch} />
    </div>);

    return (<div id="startscreen" className="section group"><div className="col span_1_of_10"></div><div className="col span_8_of_10 rpgui-content rpgui-cursor-default"><div className="startscreen-inner inner rpgui-container framed">{mainMenu}</div></div><div className="col span_1_of_10"></div></div>);
  }
}

export default StartScreen;