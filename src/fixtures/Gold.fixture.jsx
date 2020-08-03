import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import { centered } from './utils';
import Gold from '@/App/ActiveGame/Player/Gold';
import PlayerContextConsumer from '@/App/ActiveGame/player.context';
import OpponentContextConsumer from '@/App/ActiveGame/opponent.context';

export default <CoinTestingSuite gold={3} isOpponent={false}/>;

function CoinTestingSuite({ gold, isOpponent }) {
  const store = createMockedStore({
    players: {
      currentPlayer: {
        gold
      },
      opponent: {
        gold
      }
    }
  });
  console.log("CoinTestingSuite -> store", store)

  return (
    <StoreProvider
      store={store}
    >
      <PlayerContextConsumer>
        <OpponentContextConsumer>
          <div>{centered(<Gold isOpponent={isOpponent} />)}</div>
        </OpponentContextConsumer>
      </PlayerContextConsumer>
    </StoreProvider>
  );
}
