
import { createMockedStore } from './MockedStore';

// Backend stuff for testing
import State from '@/../../backend/src/structures/State';
import Customer from '@/../../backend/src/models/Customer';
import MockedEventBus, { MOCKED_CUSTOMER_UID } from './MockedEventBus';

export const store = createMockedStore({
  players: {
    uuid: MOCKED_CUSTOMER_UID
  }
});

MockedEventBus(store);

export const state = new State([new Customer(MOCKED_CUSTOMER_UID, { uid: MOCKED_CUSTOMER_UID })]);