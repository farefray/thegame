import React, { Component } from 'react';
import { getImage } from '../images.js';
import ProgressBar from '../components/ProgressBar.jsx';

class StartScreen extends Component {

  constructor (props) {
    super(props);
    this.state = {
      'nameChangeInput': ''
    };

  }

  handleNameChange = (event) => {
    if(this.state.nameChangeInput.length <= 20 && this.state.nameChangeInput !== '') {
      this.props.dispatch({type: 'UPDATE_PRIVATE_NAME', name: this.state.nameChangeInput});
    }

    this.setState({...this.state, 'nameChangeInput': ''})
    event.preventDefault();
  }

  render () {
    const loadingProgress = 100 / 3 * (this.props.connected + this.props.loaded + (this.props.playersReady !== -1)) + 1;
    

    const soundButton = (<div className='mainMenuSoundDiv marginTop5'>
        <div>
          <img className='musicImgMainMenu' src={(this.props.musicEnabled ? getImage('music') : getImage('musicMuted'))}
            alt={(this.props.musicEnabled ? 'Mute Music' : 'Turn on Music')} onClick={() => this.props.dispatch({ type: 'TOGGLE_MUSIC' })} />
        </div>
        <div>
          <img className='soundImgMainMenu' src={(this.props.soundEnabled ? getImage('sound') : getImage('soundMuted'))}
            alt={(this.props.soundEnabled ? 'Mute Sound' : 'Turn on Sound')} onClick={() => this.props.dispatch({ type: 'TOGGLE_SOUND' })} />
        </div>
        {(this.props.musicEnabled ? this.playMusic() : '')}
      </div>);

    const isLoaded = (loadingProgress >= 100);

    const mainMenu = (<div>
      <div className='startButtons'>
        <div className='flex'>
          {isLoaded ? 
          <div>
            <button className={`rpgui-button startButton ${(!this.props.ready ? 'growAnimation' : '')}`}
              onClick={this.toggleReady}>{(this.props.ready ? 'Unready' : 'Ready')}</button>
            <button style={{ marginLeft: '5px' }} className={`rpgui-button ${(this.props.playersReady === this.props.connectedPlayers ? 'growAnimation' : '')}`}
              onClick={() => this.startGameEvent()}>
              {(`Start Game (${this.props.playersReady}/${this.props.connectedPlayers})`)}
            </button>
          </div> : <ProgressBar progress={loadingProgress} loadingCounter={this.state.loadingCounter} dispatch={this.props.dispatch} />}
        </div>
      </div>

      <div className='mainMenuNameChange'>
        <form onSubmit={this.handleNameChange}>
          <label className='text_shadow'>Name:</label>
          <label>
            <input maxLength='20' placeholder={this.props.playerName} className='textInputSmaller' type="text" value={this.state.nameChangeInput}
              onChange={(event) => this.setState({ ...this.state, nameChangeInput: event.target.value })} />
          </label>
          <input className='rpgui-button golden' type="submit" value="Submit" />
        </form>
      </div>
      {soundButton}
    </div>);

    return (<div className="section group"><div className="col span_1_of_10"></div><div className="col span_8_of_10 rpgui-content rpgui-cursor-default"><div id="container"><div className="inner rpgui-container framed">{mainMenu}</div></div></div><div className="col span_1_of_10"></div></div>);
  }
}

export default StartScreen;