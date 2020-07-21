
import { createMockedStore } from './MockedStore';

// Backend stuff for testing
import Customer from '@/../../backend/src/models/Customer';
import Game from '@/../../backend/src/models/Game';
import MockedEventBus, { MOCKED_CUSTOMER_UID } from './MockedEventBus';

export const store = createMockedStore({
  players: {
    uuid: MOCKED_CUSTOMER_UID
  }
});

MockedEventBus(store);

export const game = new Game(new Customer(MOCKED_CUSTOMER_UID, { uid: MOCKED_CUSTOMER_UID }));
