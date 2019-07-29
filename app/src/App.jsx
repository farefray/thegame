import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';

import './css/grid.css';
import './App.scss';
import './animations.css';

import StartScreen from './App/StartScreen.jsx';
import ActiveGame from './App/ActiveGame.jsx';

const App = () => {
  useEffect(() => {
    document.title = `Pixel Auto Chess`;
  });

  const gameIsLive = useSelector(state => state.app.gameIsLive)
  if (!gameIsLive) {
    return <StartScreen />;
  }

  return <ActiveGame />;
}

export default connect()(App);
