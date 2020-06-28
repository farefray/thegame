import { MonsterInterface } from "../typings/Monster";
import { CardConfig } from "../typings/Card";

export default class Card {
  private name: string;
  private monster: MonsterInterface;
  private config: CardConfig;

  public cost: number;
  constructor(cardName: string, monster: MonsterInterface, cardConfig: CardConfig) {
    this.name = cardName.replace('_', ' ');
    this.monster = monster;
    this.config = cardConfig;

    this.cost = monster.cost; // todo monster cost = card cost via card config
  }


  toSocket() {
    return {
      name: this.name,
      monster: this.monster,
      config: this.config
    }
  }
}