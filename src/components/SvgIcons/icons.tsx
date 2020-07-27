/** Icons from https://game-icons.net/ */

import CardsRandom from '@/assets/icons/cards.svg';
import Swords from '@/assets/icons/swords.svg';
import Trade from '@/assets/icons/trade.svg';
import Magic from '@/assets/icons/magic-swirl.svg';
import BloodySword from '@/assets/icons/bloody-sword.svg';
import HealthPotion from '@/assets/icons/health-potion.svg';
import TwoCoins from '@/assets/icons/two-coins.svg';

export enum ICON_NAME {
  CARDS_RANDOM,
  SWORDS,
  TRADE,
  MAGIC,
  BLOODY_SWORD,
  HEALTH_POTION,
  TWO_COINS
}

export default {
  [ICON_NAME.CARDS_RANDOM]: CardsRandom,
  [ICON_NAME.SWORDS]: Swords,
  [ICON_NAME.TRADE]: Trade,
  [ICON_NAME.MAGIC]: Magic,
  [ICON_NAME.BLOODY_SWORD]: BloodySword,
  [ICON_NAME.HEALTH_POTION]: HealthPotion,
  [ICON_NAME.TWO_COINS]: TwoCoins,
}