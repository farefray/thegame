import React from 'react';
import { StateMock } from '@react-mock/state';

import GameBoard from './GameBoard';
import myMockedReduxState from '../../mockedstate.json';

export default {
    default: <GameBoard {...myMockedReduxState} />,

    mocked: (
        <StateMock state={{ statetest: true }} >
            <GameBoard {...myMockedReduxState}/>
        </StateMock>
    )
};