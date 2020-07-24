import React, { useContext } from 'react';
import Card from './Deck/Card';
import { WebSocketContext } from '@/socket.context';
import { useStoreState } from '@/store/hooks';

function Merchantry() {
  const merchantry = useStoreState((state) => state.merchantry);
  const { revealedCards, isLocked } = merchantry;

  const websocket = useContext(WebSocketContext);

  return (
    <div className={'merchantry' + (isLocked ? ' m-locked' : '')}>
      {revealedCards &&
        revealedCards.map((card, index) => {
          return (
            <div key={index} className="card-container" onClick={() => {
              if (!isLocked) {
                websocket.emitMessage('PURCHASE_CARD', index);
              }
            }}>
              <Card
                key={index}
                card={card}
              />
            </div>
          );
        })}
    </div>
  );
}

export default Merchantry;
