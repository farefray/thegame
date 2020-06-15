import React, { useContext } from 'react';
import Unit from './UnitShop/Unit';
import { Nav } from 'rsuite';
import { WebSocketContext } from '@/socket.context';

function UnitShop({ shopUnits }) {
  const websocket = useContext(WebSocketContext);

  const onPurchase = (unitIndex) => {
    websocket.emitMessage('PURCHASE_UNIT', unitIndex);
  };

  return (
    <div className="unitshop">
      {shopUnits.map((unit, index) => {
        return (
          <Nav.Item key={index}>
            <Unit key={index} unit={unit} index={index} onPurchase={onPurchase} />
          </Nav.Item>
        );
      })}
    </div>
  );
}

export default UnitShop;
