import React from 'react';
import { connect, useSelector, shallowEqual } from 'react-redux';

// import 'rsuite/lib/styles/themes/dark/index.less'; //The default style file.
import './UI/ui.less';

import Layout from './Layout';

import StartScreen from './App/StartScreen.jsx';
import ActiveGame from './App/ActiveGame.jsx';
import Notification from './App/ActiveGame/Notification.jsx';

const App = () => {
  const {gameIsLive, notification} = useSelector(state => state.app, shallowEqual);
  const activeApp = !gameIsLive ? <StartScreen /> : <ActiveGame />;
  return (
    <Layout>
      {notification && <Notification notificationObject={notification} />}
      {activeApp}
    </Layout>
  );
};

export default connect()(App);
