import React, { useContext } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import Card from './Merchantry/Card';
import { Nav } from 'rsuite';
import { WebSocketContext } from '@/socket.context';

function Merchantry() {
  const { revealedCards } = useSelector((state) => state.merchantry, shallowEqual);
  const websocket = useContext(WebSocketContext);

  return (
    <div className="merchantry">
      {revealedCards &&
        revealedCards.map((card, index) => {
          return (
            <Nav.Item key={index} className="card-container" onClick={(unitIndex) => {
              websocket.emitMessage('PURCHASE_CARD', unitIndex);
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
