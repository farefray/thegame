import React, { Component } from 'react';
import { battleReady } from '../socket';
import { getSoundEffect } from '../audio.js';

class Timer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      seconds: '00',
    }
    this.startCountDown = this.startCountDown.bind(this);
    this.tick = this.tick.bind(this);
    if(this.props.startTimer && !this.props.gameEnded){
      console.log('@Timer constructor StartingTimer', this.props.startTime)
      this.startCountDown();
      this.props.dispatch({ type: 'DISABLE_START_TIMER' });
    }
  }

  tick() {
    const sec = this.secondsRemaining;
    this.setState({
      seconds: sec
    })
    if (sec < 10) {
      this.setState({
        seconds: '0' + this.state.seconds,
      })
    }
    if(sec <= 5) {
      // console.log('@Tick')
      this.props.dispatch({type: 'NEW_SOUND_EFFECT', newSoundEffect: getSoundEffect('Tick')});
    }
    if (sec === 0) {
      console.log('@Timer.tick Stopping timer since sec === 0', sec, this.secondsRemaining)
      clearInterval(this.intervalHandle);
      if(Object.keys(this.props.storedState).length > 0){
        console.log('BattleReady!')
        this.props.dispatch({ type: 'DEACTIVATE_INTERACTIONS' });
        battleReady(this.props.storedState);
      }
    }
    this.secondsRemaining--
  }
  
  startCountDown() {
    console.log('@Timer.StartCountDown! intervalHandle', this.intervalHandle)
    this.secondsRemaining = this.props.startTime;
    clearInterval(this.intervalHandle);
    console.log('intervalHandle2', this.intervalHandle)
    this.intervalHandle = setInterval(this.tick, 1000);
    console.log('@Timer.StartCountDown: ', this.secondsRemaining, this.intervalHandle);
  }

  componentWillUnmount() {
    clearInterval(this.intervalHandle);
  }

  render () {
    return <div className='timerDiv'>
      <div className='text_shadow timerText'>{(this.state.seconds !== '00' ? this.state.seconds : '')}</div>
    </div>
  }
}

export default Timer;