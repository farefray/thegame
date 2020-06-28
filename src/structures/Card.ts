import { MonsterInterface } from "../typings/Monster";
import { CardConfig, CARD_TYPES } from "../typings/Card";

export default class Card {
  private name: string;
  private monster?: MonsterInterface;
  private config: CardConfig;

  public cost: number;
  constructor(cardName: string, cardConfig: CardConfig, monster?: MonsterInterface) {
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


  toSocket() {
    return {
      name: this.name,
      monster: this.monster,
      config: this.config
    }
  }
}