import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import { centered } from './utils';
import Player from '@/App/ActiveGame/Player';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';

const extraState = {
  player: {
    hand: [],
    deckSize: 10,
    discard: []
  }
};

const cardsFactory = new CardsFactory();
for (let index = 0; index < 5; index++) {
  extraState.player.hand.push(cardsFactory.getRandomCard());
}
for (let index = 0; index < 3; index++) {
  extraState.player.discard.push(cardsFactory.getRandomCard());
}

export default (
  <StoreProvider store={createMockedStore(extraState)}>
    {centered(<Player />)}
  </StoreProvider>
);