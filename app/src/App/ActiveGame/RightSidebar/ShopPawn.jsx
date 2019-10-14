import React from 'react';
import UnitImage from '../../../objects/Unit/UnitImage';
import Frame from '../../../Components/Frame';

function ShopPawn({ unit, index, onPurchase }) {
  console.log("TCL: ShopPawn -> unit", unit)
  return (
    <Frame className="shopunit" header={unit.name} onClick={() => onPurchase(index)} type="default">
      <div className="shopunit-stats__wrapper">
      <div className="shopunit-stats">
        <span className="shopunit-stats-stat shopunit-stats-stat__hp">{unit.hp}</span>
        <span className="shopunit-stats-stat shopunit-stats-stat__mana">{unit.mana}</span>
        <span className="shopunit-stats-stat shopunit-stats-stat__attack">{unit.attack}</span>
        <span className="shopunit-stats-stat shopunit-stats-stat__armor">{unit.armor}</span>
        <span className="shopunit-stats-stat shopunit-stats-stat__cost">{unit.cost}</span>
      </div>
      </div>
      <div className="shopunit-image">
        <UnitImage direction="3" isMoving="false" lookType={unit.lookType} extraClass="shop"/>
      </div>
    </Frame>
  );
}

export default ShopPawn;
