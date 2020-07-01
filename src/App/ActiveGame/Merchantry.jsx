import React, { useContext } from 'react';
import { useStoreState } from 'easy-peasy';
import Card from './Merchantry/Card';
import { Nav } from 'rsuite';
import { WebSocketContext } from '@/socket.context';

function Merchantry() {
  const revealedCards = useStoreState((state) => state.merchantry.revealedCards);
  const websocket = useContext(WebSocketContext);

  return (
    <div className="merchantry">
      {revealedCards &&
        revealedCards.map((card, index) => {
          return (
            <Nav.Item key={index} className="card-container" onClick={() => {
              websocket.emitMessage('PURCHASE_CARD', index);
            }}>
              <Card
                key={index}
                card={card}
              />
            </Nav.Item>
          );
        })}
    </div>
  );
}

export default Merchantry;
