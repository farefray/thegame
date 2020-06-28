import { MonsterInterface } from "../typings/Monster";
import { CardConfig } from "../typings/Card";

export default class Card {
  private name: string;
  private monster: MonsterInterface;
  private config: CardConfig;

  constructor(cardName: string, monster: MonsterInterface, cardConfig: CardConfig) {
    this.name = cardName.replace('_', ' ');
    this.monster = monster; // todo monster cost = card cost
    this.config = cardConfig;
  }


  toSocket() {
    return {
      name: this.name,
      monster: this.monster,
      config: this.config
    }
  }
}