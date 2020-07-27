import React from 'react';
import { Icon } from 'rsuite';
import iconMap, { ICON_NAME } from './icons';

const EmptyIcon = () => <span />;

const SvgIcons = (name: ICON_NAME, size?, ...rest) => {
  const icon = iconMap[name] || EmptyIcon;
  // @ts-expect-error
  return <Icon icon={icon} size={size} {...rest} />
};

export default SvgIcons;

export const ICON_NAMES = ICON_NAME; // alias
