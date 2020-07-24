import React from 'react';
import { Icon, Tooltip, Whisper } from 'rsuite';

const CardTooltip = (cardConfig) => <Tooltip>Card config: {JSON.stringify(cardConfig)}</Tooltip>;

export default function CardInner({ children, config }) {
  const { name, cost } = config;

  return (
    <React.Fragment>
      <Whisper placement="auto" trigger="hover" speaker={CardTooltip(config)} delayShow={500}>
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
      </Whisper>
    </React.Fragment>
  );
}
