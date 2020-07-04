import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';
import Card from '@/App/ActiveGame/Deck/Card';
import { centered } from './utils';

const cardsFactory = new CardsFactory();

export default (
  <StoreProvider store={createMockedStore({})}>
    <div style={{
      fontFamily: 'helvetica neue'
    }}>
    {centered(<Card card={cardsFactory.getRandomCard()} />)}
    </div>
  </StoreProvider>
);
