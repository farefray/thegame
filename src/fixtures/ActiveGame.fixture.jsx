import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { useValue } from 'react-cosmos/fixture';

import { createMockedStore } from './MockedStore';
import ActiveGame from '@/App/ActiveGame';

// Backend stuff for testing
import State from '@/../../backend/src/structures/State';
import Customer from '@/../../backend/src/models/Customer';
import MockedEventBus, { MOCKED_CUSTOMER_UID } from './MockedEventBus';
import { ABILITY_PHASE } from '@/../../backend/src/typings/Card';

const store = createMockedStore({
  player: {
    uuid: MOCKED_CUSTOMER_UID
  }
});

MockedEventBus(store);

const state = new State([new Customer(MOCKED_CUSTOMER_UID, { uid: MOCKED_CUSTOMER_UID })]);


function DebugControls() {
  return (
    <div style={{
      position: 'absolute',
      color: '#000'
    }}>
      <button
        onClick={() => {
          state.firstPlayer.dealCards();
          state.secondPlayer.dealCards();
        }}
      >
        Deal cards
      </button>

      <button
        onClick={() => {
          state.playCards(ABILITY_PHASE.INSTANT);
        }}
      >
        Play cards
      </button>
    </div>
  );
}

function ActiveGameTestingSuite(props) {
  const [rendered] = useValue('rendered', { defaultValue: true }); // failed attemp to make it rerender refs

  if (!rendered) {
    return <div />;
  }

  return (
    <StoreProvider store={store}>
      {DebugControls()}
      <ActiveGame />
    </StoreProvider>
  );
}

export default <ActiveGameTestingSuite />;
