import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { useValue } from 'react-cosmos/fixture';
import ActiveGame from '@/App/ActiveGame';
import { ABILITY_PHASE } from '@/../../backend/src/typings/Card';
import { store, game } from './emulateState';

function DebugControls() {
  return (
    <div style={{
      position: 'absolute',
      right: 0,
      color: '#000'
    }}>
      <button
        onClick={() => {
          game.state.firstPlayer.dealCards();
          game.state.secondPlayer.dealCards();
        }}
      >
        Deal cards
      </button>

      <button
        onClick={() => {
          game.state.playCards(ABILITY_PHASE.INSTANT);
        }}
      >
        Play cards
      </button>

      <button
        onClick={async () => {
          const [hadBattle, winner] = await game.processBattle();

          if (hadBattle) {
            game.state.playCards(ABILITY_PHASE.VICTORY, winner);
          }
        }}
      >
        Battle
      </button>

      {/* <button
        onClick={() => {
          if (battleWinner) {
            game.state.playCards(ABILITY_PHASE.VICTORY, battleWinner);
          }
        }}
      >
        Play victory cards
      </button> */}

      <button
        onClick={() => {
          game.state.nextRound();
        }}
      >
        Next round
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
