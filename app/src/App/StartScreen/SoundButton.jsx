import React, { Component } from 'react';
import { getImage } from '../../images.js';

const DISABLED = true; // TODO
class SoundButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  playMusic = () => {
    // console.log('@playMusic', this.props.music);
    const el = <audio ref="MusicEl" src={this.props.music} onLoadStart={() => (this.refs.MusicEl.volume = this.props.volume)} loop autoPlay />;
    if (this.refs.MusicEl) {
      this.refs.MusicEl.volume = this.props.volume;
    }
    return el;
    // return <Audio loopEnabled={true} source={source} newProps={this.props}/>
  };

  render() {
    if (DISABLED) {
      return '';
    }

    return (
      <div className="mainMenuSoundDiv marginTop5">
        <div>
          <img
            className="musicImgMainMenu"
            src={this.props.musicEnabled ? getImage('music') : getImage('musicMuted')}
            alt={this.props.musicEnabled ? 'Mute Music' : 'Turn on Music'}
            onClick={() => this.props.dispatch({ type: 'TOGGLE_MUSIC' })}
          />
        </div>
        <div>
          <img
            className="soundImgMainMenu"
            src={this.props.soundEnabled ? getImage('sound') : getImage('soundMuted')}
            alt={this.props.soundEnabled ? 'Mute Sound' : 'Turn on Sound'}
            onClick={() => this.props.dispatch({ type: 'TOGGLE_SOUND' })}
          />
        </div>
        {this.props.musicEnabled ? this.playMusic() : ''}
      </div>
    );
  }
}

export default SoundButton;
