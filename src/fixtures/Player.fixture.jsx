import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { centered } from './utils';
import Player from '@/App/ActiveGame/Player';
import { store, state } from './emulateState';

export default (
  <StoreProvider store={store}>
    <button
      onClick={() => {
        state.firstPlayer.dealCards();
        state.secondPlayer.dealCards();
      }}
    >
      Deal cards
    </button>
    {centered(<Player />)}
  </StoreProvider>
);

