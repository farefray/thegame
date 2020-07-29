import React from 'react';
import Deck from '../App/ActiveGame/Deck';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';
import { centered } from './utils';

const cardsFactory = new CardsFactory();
const cards = [];
for (let index = 0; index < 10; index++) {
  cards.push(cardsFactory.getRandomCard());
}

const isHidden = false;

const store = createMockedStore({});

export default (
  <StoreProvider store={store}>
    {centered(isHidden ? <Deck cards={new Array(10).fill({uuid: Math.random()})} /> : <Deck cards={cards} />)}
  </StoreProvider>
);