import React from 'react';
import { StoreProvider } from 'easy-peasy';
import ActiveGame from '@/App/ActiveGame';
import { createMockedStore } from './MockedStore';

const extraState = {
  app: {
    players: [{ health: 45 }, { health: 50 }]
  }
};

export default (
  <StoreProvider store={createMockedStore(extraState)}>
    <ActiveGame />
  </StoreProvider>
);