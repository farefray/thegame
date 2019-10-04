import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';

import './UI/App.scss';

import Layout from './Layout';
import Grid from 'hedron';

import StartScreen from './App/StartScreen.jsx';
import ActiveGame from './App/ActiveGame.jsx';

const App = () => {
  const gameIsLive = useSelector(state => state.app.gameIsLive);
  const activeApp = !gameIsLive ? <StartScreen /> : <ActiveGame />;
  return (
    <Layout>
      <Grid.Bounds direction="vertical" halign="center" width="100%">
        <Grid.Box fill>{activeApp}</Grid.Box>
      </Grid.Bounds>
    </Layout>
  );
};

export default connect()(App);
