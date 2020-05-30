import React from 'react';
import UnitImage from '../../../objects/Unit/UnitImage.tsx';

function Unit({ unit, index, onPurchase }) {
  return (
    <div className="shopunit" header={unit.name} onClick={() => onPurchase(index)} type="default">
      <div className="shopunit-stats__wrapper">
      <div className="shopunit-stats">
        <span className="shopunit-stats-stat shopunit-stats-stat__hp">{unit.hp}</span>
        <span className="shopunit-stats-stat shopunit-stats-stat__attack">{unit.attack.value}</span>
        <span className="shopunit-stats-stat shopunit-stats-stat__armor">{unit.armor}</span>
        <span className="shopunit-stats-stat shopunit-stats-stat__cost">{unit.cost}</span>
      </div>
      </div>
      <div className="shopunit-image">
        <UnitImage direction="3" isMoving={false} lookType={unit.lookType} extraClass="shop"/>
      </div>
    </div>
  );
}

export default Unit;
