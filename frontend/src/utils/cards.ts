import { ICON_NAMES } from "components/SvgIcons";

export function getIconName(effect) {
  switch (effect) {
    case 'damage':
      return ICON_NAMES.BLOODY_SWORD;
    case 'health':
      return ICON_NAMES.HEALTH_POTION;
    case 'gold':
      return ICON_NAMES.TWO_COINS;
    default:
      return ICON_NAMES.CARDS_RANDOM;
  }
}
