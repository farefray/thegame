import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { createMockedStore } from './MockedStore';
import CardsFactory from '@/../../backend/src/factories/CardsFactory';
import Card from '@/App/ActiveGame/Deck/Card';
import { centered } from './utils';

const cardsFactory = new CardsFactory();

export default <CardTestingSuite animated={false} revealed={true} />;

function CardTestingSuite(props) {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (mounted.current) {
    } else {
      mounted.current = true;
    }
  });

  const component = <Card card={cardsFactory.getRandomCard()} animated={props.animated} revealed={props.revealed} />;
  return (
    <StoreProvider store={createMockedStore({})}>
      <div
        style={{
          fontFamily: 'helvetica neue'
        }}
      >
        {centered(component)}
      </div>
    </StoreProvider>
  );
}
