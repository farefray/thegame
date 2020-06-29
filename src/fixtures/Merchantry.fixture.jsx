import React from 'react';
import Merchantry from '../App/ActiveGame/Merchantry';
import { Provider } from 'react-redux';
import { createMockedStore } from './MockedStore';


export default (
  <Provider store={createMockedStore({})}>
    <Merchantry />
  </Provider>
);