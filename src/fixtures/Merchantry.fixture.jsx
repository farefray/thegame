import React from 'react';
import Merchantry from '../App/ActiveGame/Merchantry';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import { centered } from './utils';

export default (
  <StoreProvider store={createMockedStore({})}>
    {
      centered(<Merchantry />)
    }
  </StoreProvider>
);
