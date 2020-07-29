import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { useValue } from 'react-cosmos/fixture';
import ActiveGame from '@/App/ActiveGame';
import { store, game } from './emulateState';

import WebSocketProvider from '@/socket.context';
import { MOCKED_CUSTOMER_UID } from './MockedEventBus';

import { EVENT_SUBTYPE } from '@/../../backend/src/typings/EventBus';
import { ABILITY_PHASE } from '@/../../backend/src/typings/Card';

let battleWinner;
const DebugControls = () => (
  <div style={{
    position: 'absolute',
    right: 0,
    color: '#000',
    zIndex: 999
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
        console.log("DebugControls -> hadBattle, winner", hadBattle, winner)

        battleWinner = winner;
      }}
    >
      Battle
    </button>

    <button
      onClick={() => {
        if (battleWinner) {
          game.state.playCards(ABILITY_PHASE.VICTORY, battleWinner);
        } else {
          alert('No wiiner, no battle')
        }
      }}
    >
      Play victory cards
    </button>

    <button
      onClick={() => {
        game.gamePhase(2);
        game.state.tradeRound(true);
      }}
    >
      Trade round
    </button>

    <button
      onClick={() => {
        game.state.nextRound();
      }}
    >
      Next round
    </button>
  </div>
);

setTimeout(() => {
  game.state.getPlayer(MOCKED_CUSTOMER_UID).invalidate(EVENT_SUBTYPE.PLAYER_SYNC);
}, 1000);

function ActiveGameTestingSuite(props) {
  const [rendered] = useValue('rendered', { defaultValue: true }); // failed attemp to make it rerender refs

  if (!rendered) {
    return <div />;
  }

  // instead of socket connected, we mock it, to pass events from 'frontend' to 'backend' which is actually all on frontend for react-cosmos ;)
  const injectedWS = {
    socket: {},
    emitMessage: (type, payload) => {
      if (type === 'PURCHASE_CARD') {
        game.state.purchaseCard(MOCKED_CUSTOMER_UID, payload);
      }
      console.log("ActiveGameTestingSuite -> type, payload?", type, payload);
    }
  };

  return (
    <StoreProvider store={store}>
      <WebSocketProvider injectedWS={injectedWS}>
        <DebugControls />
        <ActiveGame />
      </WebSocketProvider>
    </StoreProvider>
  );
}

export default <ActiveGameTestingSuite />;
