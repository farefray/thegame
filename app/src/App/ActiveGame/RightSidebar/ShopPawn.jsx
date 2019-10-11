import React from 'react';
import UnitImage from '../../../objects/Unit/UnitImage';
import Frame from '../../../Components/Frame';

function ShopPawn({ unit, index, onPurchase }) {
  return (
    <Frame header={unit.name} onClick={() => onPurchase(index)} type="default">
      <UnitImage direction="3" isMoving="false" lookType={unit.lookType} extraClass="shop"/>
    </Frame>
  );
}

export default ShopPawn;
