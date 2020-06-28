import { MonsterInterface } from '../typings/Monster';
import { CardConfig, CARD_TYPES, ABILITY_PHASE } from '../typings/Card';
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';
import Player from './Player';

export default class Card extends EventBusUpdater {
  private name: string;
  private monster?: MonsterInterface;
  private config: CardConfig;

  public cost: number;
  constructor(cardName: string, cardConfig: CardConfig, monster?: MonsterInterface) {
    super(EVENTBUS_MESSAGE_TYPE.CARD_PLAY);

    this.name = cardName.replace('_', ' ');
    this.config = cardConfig;
    this.cost = cardConfig.cost;

    if (monster) {
      this.monster = monster;
    }
  }

  get type() {
    if (this.monster) {
      return CARD_TYPES.CARD_MONSTER;
    }

    return CARD_TYPES.CARD_ITEM;
  }

  get instant() {
    return this.config.instant;
  }

  public applyAbilities(player: Player, opponent: Player, phase: ABILITY_PHASE) {
    const abilities = phase === ABILITY_PHASE.INSTANT ? this.config.instant : this.config.victory;

    if (!abilities) {
      return true;
    }

    Object.keys(abilities).forEach((ability) => {
      switch (ability) {
        case 'gold': {
          player.gold += abilities[ability] ?? 0;
          break;
        }

        default: {
          throw new Error('Not handled instant card ability');
          break;
        }
      }
    });
  }

  ////

  public invalidate() {
    // todo format custom body maybe?
    super.invalidate();
  }

  toSocket() {
    return {
      name: this.name,
      monster: this.monster,
      config: this.config
    };
  }
}
