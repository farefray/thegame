import React from 'react';
import Merchantry from '../App/ActiveGame/Merchantry';
import configureMockStore from './configureMockStore';
import { Provider } from 'react-redux';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';

const cardsFactory = new CardsFactory();
const revealedCards = [];
for (let index = 0; index < 5; index++) {
  revealedCards.push(cardsFactory.getRandomCard());
}

const MockedStore = configureMockStore({
  merchantry: {
    revealedCards
  }
})

export default (
  <Provider store={MockedStore}>
    <Merchantry />
  </Provider>
);