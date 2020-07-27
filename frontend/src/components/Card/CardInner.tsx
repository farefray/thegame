import React from 'react';
import { Tooltip, Whisper } from 'rsuite';
import SvgIcons, { ICON_NAMES } from 'components/SvgIcons';

const CardTooltip = (cardConfig) => <Tooltip>Card config: {JSON.stringify(cardConfig)}</Tooltip>;

export default function CardInner({ children, config }) {
  const { name, cost } = config;

  return (
    <React.Fragment>
      <Whisper placement="auto" trigger="hover" speaker={CardTooltip(config)} delayShow={500}>
        <React.Fragment>
          <div className="frame-header">
            <div className="frame-header_icon">{config.monster ? SvgIcons(ICON_NAMES.SWORDS) : SvgIcons(ICON_NAMES.MAGIC)}</div>
            <span className="frame-header_name">{name}</span>
            <div className="frame-header_cost">
              <p className={'m m-' + cost}>{cost}</p>
            </div>
          </div>

          {children}
        </React.Fragment>
      </Whisper>
    </React.Fragment>
  );
}
