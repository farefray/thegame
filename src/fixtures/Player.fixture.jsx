import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import { centered } from './utils';
import Player from '@/App/ActiveGame/Player';

// Backend stuff for testing
import BackendPlayer from '@/../../backend/src/structures/Player';

// DI
require('./MockedEventBus');


const backendPlayer = new BackendPlayer();
const playerState = {
  player: backendPlayer.toSocket()
};

const store = createMockedStore(playerState);

export default (
  <StoreProvider store={store}>
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
    {centered(<Player />)}
  </StoreProvider>
);

