import React from 'react';
import { connect, useSelector } from 'react-redux';

// import 'rsuite/lib/styles/themes/dark/index.less'; //The default style file.
import './UI/ui.less';

import Layout from './Layout';

import StartScreen from './App/StartScreen.jsx';
import ActiveGame from './App/ActiveGame.jsx';

const App = () => {
  const gameIsLive = useSelector(state => state.app.gameIsLive);
  const activeApp = !gameIsLive ? <StartScreen /> : <ActiveGame />;
  return (
    <Layout>
        {activeApp}
    </Layout>
  );
};

export default connect()(App);
