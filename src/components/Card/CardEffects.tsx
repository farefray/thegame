import React from 'react';
import { getIconName } from '@/utils/cards';
import SvgIcons from 'components/SvgIcons';

export default function CardEffects({ config, modifiers }) {
  return (
    <div className={'frame-effects' + ' ' + modifiers?.join(' ')}>
      {config &&
        Object.keys(config).map((key, i) => (
          <span key={i} className={'effect effect-' + key}>
            {SvgIcons(getIconName(key))} {config[key]}
          </span>
        ))}
    </div>
  );
}
