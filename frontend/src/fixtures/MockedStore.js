import { createStore } from 'easy-peasy';
import storeModel from '@/store/model';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';

const cardsFactory = new CardsFactory();
const revealedCards = [];
for (let index = 0; index < 5; index++) {
  revealedCards.push(cardsFactory.getRandomCard());
}

const extraState = {
  merchantry: {
    revealedCards
  }
};

export function createMockedStore(adjustedState) {
  return createStore({...storeModel, ...extraState, ...adjustedState})
}