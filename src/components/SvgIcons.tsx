/** Icons from https://game-icons.net/ */
/** TODO better way to handle custom svg icons :) */
import React from 'react';
import CardsRandom from '@/assets/icons/cards.svg';
import Swords from '@/assets/icons/swords.svg';
import Trade from '@/assets/icons/trade.svg';
import Magic from '@/assets/icons/magic-swirl.svg';

import { Icon } from 'rsuite';

export enum ICON_NAME {
  CARDS_RANDOM,
  SWORDS,
  TRADE,
  MAGIC
}

export default function SvgIcons(iconName: ICON_NAME, size?: 'lg' | '2x' | '3x' | '4x' | '5x') {
  let icon;
  switch (iconName) {
    case ICON_NAME.CARDS_RANDOM: {
      icon = CardsRandom;
      break;
    }

    case ICON_NAME.SWORDS: {
      icon = Swords;
      break;
    }

    case ICON_NAME.TRADE: {
      icon = Trade;
      break;
    }

    case ICON_NAME.MAGIC: {
      icon = Magic;
      break;
    }
  }

  return <Icon icon={icon} size={size || 'lg'} />;
}
