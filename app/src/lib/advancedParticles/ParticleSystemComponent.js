import { initWebgl } from './webgl.js';
import React, { Component } from 'react';
import spriteImg from '../../assets/particles/1.gif';

export class ParticleSystemComponent extends Component {
  componentDidMount() {
    this.initParticleSystem();
  }

  initParticleSystem() {
    let canvas = this.refs.canvas;
    canvas.style['pointer-events'] = 'none'; //This has to be set this way and not the react way.
    canvas.style.width = '512px';
    canvas.style.height = '512px';
    canvas.style.zIndex = '150';
    initWebgl(canvas, this.refs.spriteSheet);
  }

  render() {
    return (
      <div>
        <img ref="spriteSheet" src={spriteImg} style={{ display: 'none' }} />
        <canvas ref="canvas" width="512px" height="512px" style={{ position: 'absolute', top: '0', left: '0' }}></canvas>
      </div>
    );
  }
}
