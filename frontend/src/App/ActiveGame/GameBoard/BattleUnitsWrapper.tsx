import React from 'react';
import Unit from '@/objects/Unit';

function BattleUnitsWrapper({ unitComponents, dispatchUnitLifecycle }) {
  return (
    <React.Fragment>
      {Object.keys(unitComponents).map((key) => {
        return <Unit key={key} unit={unitComponents[key]} onLifecycle={dispatchUnitLifecycle} />;
      })}
    </React.Fragment>
  );
}

export default BattleUnitsWrapper;
