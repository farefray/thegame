import React from 'react';
import { ReduxMock } from 'react-cosmos-redux';
import { createStore } from 'redux';

import ActiveGame from './ActiveGame';
import myMockedReduxState from '../mockedstate.json';
import rootReducer from '../reducers';

const generateMoves = true; // emulating next actions for actionstack
if (generateMoves) {
    const last = myMockedReduxState.app.actionStack.length;
    let lastMove = myMockedReduxState.app.actionStack[last - 1];

    myMockedReduxState.app.actionStack.push({
        "action": 1,
        "from": {
            "x": 2,
            "y": 3
        },
        "to": null,
        "time": 5500
    });

    for (let index = 0; index < 10; index++) {
        let randomBoolean = Math.random() >= 0.5;
        let nextX = randomBoolean ? (Math.random() >= 0.5 ? lastMove.to.x + 1 : lastMove.to.x - 1) : lastMove.to.x;
        if (nextX <= 0 || nextX > 7) {
            nextX = lastMove.from.x;
            randomBoolean = !randomBoolean;
        }

        let nextY = !randomBoolean ? (Math.random() >= 0.5 ? lastMove.to.y + 1 : lastMove.to.y - 1) : lastMove.to.y;
        if (nextY <= 0 || nextY > 7) {
            nextY = lastMove.to.y;
        }

        lastMove = {
            "action": 1,
            "from": {
                "x": lastMove.to.x,
                "y": lastMove.to.y
            },
            "to": {
                "x": nextX,
                "y": nextY
            },
            "time": lastMove.time + 1000
        };
        myMockedReduxState.app.actionStack.push(lastMove);
    }
}

export default <ReduxMock configureStore={state => createStore(rootReducer, state)}
    initialState={myMockedReduxState} >
    <ActiveGame />
</ReduxMock>;
