import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import ActiveGame from '@/App/ActiveGame';
// Backend stuff for testing
import BackendPlayer from '@/../../backend/src/structures/Player';

// DI
require('./MockedEventBus');

const backendPlayer = new BackendPlayer();
const playerState = {
  player: backendPlayer.toSocket()
};

const store = createMockedStore(playerState);
const actions = store.getActions();

actions.app.setCountdown(150);
console.log('store', store.getState());

setTimeout(() => {
  store.getActions().player.updatePlayer({
    ...backendPlayer.toSocket(),
    health: 25
  });
}, 2000);
export default <ActiveGameTestingSuite />;

function DebugControls() {
  return (
    <button
      onClick={() => {
        backendPlayer.dealCards();

        store.getActions().player.updatePlayer({
          subtype: 'PLAYER_CARDS_DEALED',
          ...backendPlayer.toSocket('PLAYER_CARDS_DEALED')
        });
      }}
    >
      Deal cards
    </button>
  );
}

function ActiveGameTestingSuite(props) {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (mounted.current) {
    } else {
      mounted.current = true;
    }
  });

  return (
    <StoreProvider store={store}>
      {DebugControls()}
      <ActiveGame />
    </StoreProvider>
  );
}
