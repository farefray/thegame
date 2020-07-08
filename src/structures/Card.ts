import { MonsterInterface } from '../typings/Monster';
import { v4 as uuidv4 } from 'uuid';
import { CardConfig, CARD_TYPES, ABILITY_PHASE, CardAction, EFFECT_TYPE } from '../typings/Card';
import Player from './Player';

export default class Card {
  private uuid = uuidv4();
  private name: string;
  public monster?: MonsterInterface;
  private config: CardConfig;
  public cost: number;

  constructor(cardName: string, cardConfig: CardConfig, monster?: MonsterInterface) {
    this.name = cardName.replace('_', ' ');
    this.config = cardConfig;
    this.cost = cardConfig.cost;

    if (monster) {
      this.monster = {
        ...monster,
        name: cardName
      };
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

  public getCardAction(player: Player, opponent: Player, phase: ABILITY_PHASE) {
    const abilities = phase === ABILITY_PHASE.INSTANT ? this.config.instant : this.config.victory;

    if (!abilities) {
      return null;
    }

    const action: CardAction = {
      uuid: this.uuid,
      type: this.type,
      owner: player.getUID(),
      effects: []
    }

    // todo some factory
    Object.keys(abilities).forEach((ability) => {
      const value = abilities[ability];

      switch (ability) {
        case 'gold': {
          action.effects.push({
            type: EFFECT_TYPE.GOLD,
            payload: value
          })

          break;
        }

        case 'health': {
          action.effects.push({
            type: EFFECT_TYPE.HEAL,
            payload: value
          })

          break;
        }

        case 'damage': {
          action.effects.push({
            type: EFFECT_TYPE.DAMAGE,
            payload: value
          })

          break;
        }

        default: {
          throw new Error('Not handled instant card ability');
        }
      }
    });

    return action;
  }


  toSocket() {
    return {
      uuid: this.uuid,
      name: this.name,
      monster: this.monster,
      config: this.config,
      cost: this.cost
    };
  }
}
