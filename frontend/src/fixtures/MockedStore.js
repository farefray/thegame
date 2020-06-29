import rootReducer from '@/reducers';
import configureMockStore from './configureMockStore';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';


const cardsFactory = new CardsFactory();
const revealedCards = [];
for (let index = 0; index < 5; index++) {
  revealedCards.push(cardsFactory.getRandomCard());
}

const initialState = rootReducer({}, { type: 'INIT' });
const merchantry = {
  merchantry: {
    revealedCards
  }
};

export function createMockedStore(adjustedState) {
  return configureMockStore({...initialState, ...merchantry, ...adjustedState})
}