import React from 'react';
import { OpponentContextConsumer } from "./opponent.context";
import { PlayerContextConsumer } from "./player.context";

const anyPlayerContextConsumer = (isOpponent, childrenFn) => (
  isOpponent
    ? <OpponentContextConsumer>
      {opponent => childrenFn(opponent)}
    </OpponentContextConsumer>
    : <PlayerContextConsumer>
      {player => childrenFn(player)}
    </PlayerContextConsumer>
);

export default anyPlayerContextConsumer;