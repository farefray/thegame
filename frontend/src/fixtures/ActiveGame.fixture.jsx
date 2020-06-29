import React from 'react';
import { Provider } from 'react-redux';
import ActiveGame from '@/App/ActiveGame';
import { createMockedStore } from './MockedStore';


export default (
  <Provider store={createMockedStore({})}>
    <ActiveGame />
  </Provider>
);