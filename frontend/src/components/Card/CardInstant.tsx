import React from 'react';
import SvgIcons from 'components/SvgIcons';
import { getIconName } from '@/utils/cards';

export default function CardInstant({ config }) {
  return (
    <div className="frame-instant">
      Instant:
      <div className="frame-victory_effects">
      {config &&
        Object.keys(config).map((key, i) => (
          <span key={i}>
            {SvgIcons(getIconName(key))} {config[key]}
          </span>
        ))}
      </div>
    </div>
  );
}
