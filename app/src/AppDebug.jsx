import React, { Component } from 'react';

import './css/grid.css';
import './App.scss';
import './animations.css';

import ActiveGame from './App/ActiveGame.jsx';

class AppDebug extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <ActiveGame {...this.props} />;
  }
}

export default AppDebug;
