import React from 'react';
import Unit from './UnitShop/Unit';
import { Nav } from 'rsuite';
import { SocketConnector } from '@/socketConnector';

function UnitShop({ shopUnits }) {
  const onPurchase = (unitIndex) => {
    // ! shall we validate it on frontend at least just a lil bit? TODO
    SocketConnector.purchaseUnit(unitIndex);
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
