import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { centered } from './utils';
import Player from '@/App/ActiveGame/Player';
import { store, game } from './emulateState';

export default (
  <StoreProvider store={store}>
    <button
      onClick={() => {
        game.state.firstPlayer.dealCards();
        game.state.secondPlayer.dealCards();
      }}
    >
      Deal cards
    </button>
    {centered(<Player />)}
  </StoreProvider>
);

