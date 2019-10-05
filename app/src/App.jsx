import React from 'react';
import { connect, useSelector } from 'react-redux';

import './UI/App.scss';

import Layout from './Layout';

import StartScreen from './App/StartScreen.jsx';
import ActiveGame from './App/ActiveGame.jsx';

const App = () => {
  const gameIsLive = useSelector(state => state.app.gameIsLive);
  const activeApp = !gameIsLive ? <StartScreen /> : <ActiveGame />;
  return (
    <Layout>
      <Block display="flex" justifyContent="center">
        {activeApp}
      </Block>
    </Layout>
  );
};

export default connect()(App);
