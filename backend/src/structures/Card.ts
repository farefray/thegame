import { MonsterInterface } from '../typings/Monster';
import { v4 as uuidv4 } from 'uuid';
import { CardConfig, CARD_TYPES, ABILITY_PHASE, EFFECT_TYPE } from '../typings/Card';
import Player from './Player';
import { CardAction } from './Card/CardAction';
import { UserUID } from '../utils/types';

export default class Card {
  private _uuid = uuidv4();
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

  get uuid() {
    return this._uuid;
  }

  public getCardAction(player: Player, opponent: Player, phase: ABILITY_PHASE, victoryUserUID?: UserUID) {
    const activeEffects = (
      phase === ABILITY_PHASE.INSTANT ? this.config.instant : // initial phase cards played for both players
        (player.getUID() === victoryUserUID ? this.config.victory : null) // victory phase is played only for battle winner
    );

    const cardAction = new CardAction({
      uuid: this.uuid,
      type: this.type,
      owner: player.getUID(),
      effects: [],
      monsterName: this.monster?.name,
      phase,
      isDone: phase === ABILITY_PHASE.VICTORY || !this.config.victory
    }, [player.getUID(), opponent.getUID()]);

    if (!activeEffects) {
      return cardAction;
    }

    // todo some factory ?
    Object.keys(activeEffects).forEach((ability) => {
      const value = activeEffects[ability];

      switch (ability) {
        case 'gold': {
          cardAction.effects.push({
            type: EFFECT_TYPE.GOLD,
            payload: value
          })

          break;
        }

        case 'health': {
          cardAction.effects.push({
            type: EFFECT_TYPE.HEAL,
            payload: value
          })

          break;
        }

        case 'damage': {
          cardAction.effects.push({
            type: EFFECT_TYPE.DAMAGE,
            payload: -value
          })

          break;
        }

        default: {
          throw new Error('Not handled instant card ability');
        }
      }
    });

    return cardAction;
  }


  toSocket() {
    return {
      uuid: this.uuid,
      name: this.name,
      monster: this.monster,
      config: this.config,
      cost: this.cost,
    };
  }
}
