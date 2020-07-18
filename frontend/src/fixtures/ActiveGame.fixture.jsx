import React from 'react';
import { StoreProvider } from 'easy-peasy';

import { createMockedStore } from './MockedStore';
import ActiveGame from '@/App/ActiveGame';

// Backend stuff for testing
import State from '@/../../backend/src/structures/State';
import Customer from '@/../../backend/src/models/Customer';
import MockedEventBus from './MockedEventBus';
import { ABILITY_PHASE } from '@/../../backend/src/typings/Card';

const store = createMockedStore({});
MockedEventBus(store);

const state = new State([new Customer('MOCK_SOCKETID_1', { uid: 'MOCK_SOCKETID_1' })]);

export default <ActiveGameTestingSuite />;

function DebugControls() {
  return (<>
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
    </>
  );
}

function ActiveGameTestingSuite(props) {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (mounted.current) {
    } else {
      mounted.current = true;
    }
  });

  return (
    <StoreProvider store={store}>
      {DebugControls()}
      <ActiveGame />
    </StoreProvider>
  );
}
