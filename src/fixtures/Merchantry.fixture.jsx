import React from 'react';
import Merchantry from '../App/ActiveGame/Merchantry';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';


export default (
  <StoreProvider store={createMockedStore({})}>
    <Merchantry />
  </StoreProvider>
);