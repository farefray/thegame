import React from 'react';
import { useStoreState } from 'easy-peasy';

// import 'rsuite/lib/styles/themes/dark/index.less'; //The default style file.
import './UI/ui.less';

import Layout from './Layout';

import StartScreen from './App/StartScreen.jsx';
import ActiveGame from './App/ActiveGame.jsx';
import Notification from './App/ActiveGame/Notification.jsx';
import { useStoreActions } from './store/hooks';
import { auth } from '@/firebase';

const App = () => {
  const isGameLive = useStoreState((state) => state.app.isGameLive);
  const notification = useStoreState((state) => state.app.notification);

  const authenticate = useStoreActions(actions => actions.customer.authenticate)
  // users auth presence
  auth.onAuthStateChanged((user) => {
    // TODO need to check if user is logged in and trigger thunk only if auth really changed
    authenticate(user);
  });

  return (
      <Layout>
        {notification && <Notification notificationObject={notification} />}
        {!isGameLive ? <StartScreen /> : <ActiveGame />}
      </Layout>
  );
};

export default App;
