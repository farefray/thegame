import React from 'react';
import { StateMock } from '@react-mock/state';

import ActiveGame from './ActiveGame';
import myMockedReduxState from '../mockedstate.json';

export default <StateMock state={{ activeBattle: false }} >
    <ActiveGame {...myMockedReduxState} dispatch={(obj) => {
        console.log('Dispatch', obj);
    }} />
</StateMock>;
