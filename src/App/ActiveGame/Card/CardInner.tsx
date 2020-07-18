import React from 'react';
import { Icon } from 'rsuite';

export default function CardInner({ name, cost, children }) {
  return (
    <React.Fragment>
      <div className="frame-header">
        <div className="frame-header_icon">
          <Icon icon="star-half-o" />
        </div>
        <span className="frame-header_name">{name}</span>
        <div className="frame-header_cost">{cost}</div>
      </div>

      {children}

    </React.Fragment>
  );
}
