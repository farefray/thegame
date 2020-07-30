import React, { useContext } from 'react';
import { WebSocketContext } from '@/socket.context';
import { useStoreState } from '@/store/hooks';
import CardComponent from 'components/Card/CardComponent';

function Merchantry() {
  const merchantry = useStoreState((state) => state.merchantry);
  const { revealedCards, isLocked } = merchantry;

  const websocket = useContext(WebSocketContext);

  return (
    <div className={'merchantry' + (isLocked ? ' m-locked' : '')}>
      {revealedCards &&
        revealedCards.map((card, index) => {
          return (
            <div
              key={index}
              className="card-container"
              onClick={() => {
                if (!isLocked) {
                  websocket.emitMessage('PURCHASE_CARD', index);
                }
              }}
            >
              <CardComponent card={card} revealed={true} />
            </div>
          );
        })}
    </div>
  );
}

export default Merchantry;
