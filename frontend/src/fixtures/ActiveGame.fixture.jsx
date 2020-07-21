import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { useValue } from 'react-cosmos/fixture';
import ActiveGame from '@/App/ActiveGame';
import { ABILITY_PHASE } from '@/../../backend/src/typings/Card';
import { store, state } from './emulateState';

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
