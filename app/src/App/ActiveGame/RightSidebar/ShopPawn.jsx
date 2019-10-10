import React from 'react';
import UnitImage from '../../../objects/Unit/UnitImage';
import Frame from '../../../Components/Frame';

function ShopPawn({ unit, index, onPurchase }) {
  return (
    <Frame header={unit.name} onClick={() => onPurchase(index)} bordered>
      <UnitImage direction="3" isMoving="false" lookType={unit.lookType} />
    </Frame>
  );
}

export default ShopPawn;
