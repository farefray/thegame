import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { Flex } from 'rebass';

import './UI/App.scss';

import Layout from './Layout';
import StartScreen from './App/StartScreen.jsx';
import ActiveGame from './App/ActiveGame.jsx';

const App = () => {
  useEffect(() => {
    document.title = `Pixel Auto Chess`;
  });

  const gameIsLive = useSelector(state => state.app.gameIsLive);
  const activeApp = !gameIsLive ? <StartScreen /> : <ActiveGame />;
  return (
    <Layout>
      <Flex
        sx={{
          mx: 'auto',
          px: 3,
          minHeight: '100vh'
        }}
        color="foreground"
        bg="background"
        flexDirection="column"
        width="100%"
      >
        {activeApp}
      </Flex>
    </Layout>
  );
};

export default connect()(App);
