import React from 'react';
import Deck from '../App/ActiveGame/Deck';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';
import { centered } from './utils';

const cardsFactory = new CardsFactory();
const cards = [];
for (let index = 0; index < 5; index++) {
  cards.push(cardsFactory.getRandomCard());
}

const isEmpty = false;

const store = createMockedStore({});

export default (
  <StoreProvider store={store}>
    {centered(<Deck cards={isEmpty ? new Array(10).fill({}) : cards} />)}
  </StoreProvider>
);