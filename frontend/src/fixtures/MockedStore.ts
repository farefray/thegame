import { createStore } from 'easy-peasy';
import storeModel from '@/store/model';
import { mergeDeep } from './utils';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';
import Card from '@/../../backend/src/structures/Card';

const cardsFactory = new CardsFactory();
const revealedCards: Card[] = [];
for (let index = 0; index < 5; index++) {
  revealedCards.push(cardsFactory.getRandomCard());
}

const extraState = {
  merchantry: {
    revealedCards
  }
};

export function createMockedStore(adjustedState) {
  return createStore(mergeDeep(storeModel, extraState, adjustedState));
}